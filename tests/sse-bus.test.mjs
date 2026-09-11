import assert from "node:assert";
import { describe, it, after } from "node:test";
import { notifBus } from "../src/lib/sse.ts";

describe("NotificationBus (SSE fan-out)", () => {
  it("local emit: subscribe nhận đúng data", async () => {
    const received = [];
    const unsub = notifBus.subscribe("notif:test-user", (data) => received.push(data));
    await notifBus.publish("notif:test-user", { title: "Hi", message: "Hello" });
    unsub();
    assert.strictEqual(received.length, 1);
    assert.strictEqual(received[0].title, "Hi");
  });

  it("unsubscribe: không nhận nữa sau khi hủy", async () => {
    const received = [];
    const unsub = notifBus.subscribe("notif:ghost", (data) => received.push(data));
    unsub();
    await notifBus.publish("notif:ghost", { title: "X" });
    assert.strictEqual(received.length, 0);
  });

  it("channels độc lập: staff không nhận event user khác", async () => {
    const staff = [];
    const user = [];
    const u1 = notifBus.subscribe("notif:staff", (d) => staff.push(d));
    const u2 = notifBus.subscribe("notif:user-1", (d) => user.push(d));
    await notifBus.publish("notif:user-1", { title: "Y" });
    u1();
    u2();
    assert.strictEqual(user.length, 1);
    assert.strictEqual(staff.length, 0);
  });

  it("distributed=false khi không có env Redis (single-instance fallback)", () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    assert.strictEqual(notifBus.distributed, false);
  });

  it("distributed=true khi mock env Redis (không gọi mạng nhờ mock fetch)", async () => {
    const origUrl = process.env.UPSTASH_REDIS_REST_URL;
    const origToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    const origFetch = globalThis.fetch;
    try {
      process.env.UPSTASH_REDIS_REST_URL = "https://fake-upstash.local";
      process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
      assert.strictEqual(notifBus.distributed, true);

      // Mock fetch: kiểm tra XADD được gọi với đúng channel
      // (implementation dùng Upstash JSON-RPC: POST body ["XADD", stream, ..., "channel", channel, "data", ...])
      const calls = [];
      globalThis.fetch = async (url, init) => {
        calls.push({ url, init });
        return { json: async () => ({ result: "ok-1" }) };
      };
      await notifBus.publish("notif:user-9", { title: "RedisFanout" });
      const hit = calls.find((c) => {
        try {
          const body = JSON.parse(c.init?.body ?? "[]");
          return body[0] === "XADD" && body.includes("notif:user-9");
        } catch {
          return false;
        }
      });
      assert.ok(hit, "phải XADD lên Redis stream với channel notif:user-9");
    } finally {
      if (origUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
      else process.env.UPSTASH_REDIS_REST_URL = origUrl;
      if (origToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
      else process.env.UPSTASH_REDIS_REST_TOKEN = origToken;
      globalThis.fetch = origFetch;
    }
  });

  after(() => notifBus.removeAllListeners());
});
