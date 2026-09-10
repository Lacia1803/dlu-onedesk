import assert from "node:assert";
import { describe, it } from "node:test";
import { cached, rateLimit, cache } from "../src/lib/cache.ts";

describe("In-memory cache", () => {
  it("returns cached value without recomputing", async () => {
    let calls = 0;
    const fn = async () => { calls++; return calls; };
    assert.strictEqual(await cached("t1", 60_000, fn), 1);
    assert.strictEqual(await cached("t1", 60_000, fn), 1);
    assert.strictEqual(calls, 1);
  });

  it("recomputes after TTL expires", async () => {
    let calls = 0;
    const fn = async () => { calls++; return calls; };
    assert.strictEqual(await cached("t2", 15, fn), 1);
    await new Promise((r) => setTimeout(r, 25));
    assert.strictEqual(await cached("t2", 15, fn), 2);
  });
});

describe("Rate limiter", () => {
  it("allows up to limit within window then blocks", () => {
    for (let i = 0; i < 3; i++) {
      assert.strictEqual(rateLimit("u1:act", 3, 60_000).allowed, true, `call ${i + 1} should pass`);
    }
    assert.strictEqual(rateLimit("u1:act", 3, 60_000).allowed, false);
  });

  it("resets after window expires", async () => {
    assert.strictEqual(rateLimit("u2:act", 1, 20).allowed, true);
    assert.strictEqual(rateLimit("u2:act", 1, 20).allowed, false);
    await new Promise((r) => setTimeout(r, 30));
    assert.strictEqual(rateLimit("u2:act", 1, 20).allowed, true);
  });

  it("keys are independent", () => {
    assert.strictEqual(rateLimit("u3:a", 1, 60_000).allowed, true);
    assert.strictEqual(rateLimit("u3:b", 1, 60_000).allowed, true);
    assert.strictEqual(rateLimit("u3:a", 1, 60_000).allowed, false);
  });
});
