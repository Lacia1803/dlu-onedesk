import { EventEmitter } from "events";

const STREAM_KEY = "onedesk:notif:stream";
const POLL_INTERVAL_MS = 1000;

/**
 * Event bus cho Server-Sent Events (SSE), hỗ trợ 2 chế độ:
 * - Single instance (mặc định): EventEmitter trong tiến trình Node.js.
 * - Multi instance / Microservices: khi cấu hình UPSTASH_REDIS_REST_URL + _TOKEN,
 *   publish qua Redis Stream (XADD) và mỗi tiến trình subscribe bằng XREAD polling,
 *   giúp thông báo đến đúng người dùng dù request xử lý ở container khác.
 */
class NotificationBus extends EventEmitter {
  private get redisUrl() {
    return process.env.UPSTASH_REDIS_REST_URL;
  }
  private get redisToken() {
    return process.env.UPSTASH_REDIS_REST_TOKEN;
  }
  /** Có nghĩa true khi Redis được cấu hình (chế độ phân tán). */
  get distributed(): boolean {
    return Boolean(this.redisUrl && this.redisToken);
  }

  private pollTimer: NodeJS.Timeout | null = null;
  private lastId = "$";
  private polling = false;
  private activeSubscribers = 0;

  private async redis(args: unknown[]): Promise<unknown> {
    const res = await fetch(this.redisUrl!, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    const json = (await res.json()) as { result?: unknown; error?: unknown };
    if (json.error) throw new Error(String(json.error));
    return json.result ?? null;
  }

  /**
   * Phát thông báo tới kênh. Ở chế độ phân tán, chỉ XADD lên Redis Stream
   * (instance này cũng nhận lại qua XREAD — không emit kép). Nếu Redis lỗi,
   * fallback emit cục bộ để thông báo không mất hẳn trên instance hiện tại.
   */
  async publish(channel: string, data: unknown): Promise<void> {
    if (this.distributed) {
      try {
        await this.redis([
          "XADD",
          STREAM_KEY,
          "MAXLEN",
          "~",
          "1000",
          "*",
          "channel",
          channel,
          "data",
          JSON.stringify(data),
        ]);
        return;
      } catch {
        // Rơi xuống fallback cục bộ
      }
    }
    this.emit(channel, data);
  }

  /** Đăng ký listener; trả về hàm hủy đăng ký (dùng trong req.signal abort). */
  /** Đăng ký listener; trả về hàm hủy đăng ký (dùng trong req.signal abort). */
  subscribe(channel: string, listener: (data: unknown) => void): () => void {
    this.on(channel, listener);
    this.activeSubscribers++;
    if (this.distributed) this.startPoller();
    return () => {
      this.off(channel, listener);
      this.activeSubscribers = Math.max(0, this.activeSubscribers - 1);
      if (this.activeSubscribers === 0) this.stopPoller();
    };
  }

  private startPoller() {
    if (this.pollTimer) return;
    this.pollTimer = setInterval(() => void this.poll(), POLL_INTERVAL_MS);
    this.pollTimer.unref?.();
  }

  private stopPoller() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async poll() {
    if (this.polling || !this.distributed) return;
    this.polling = true;
    try {
      const result = (await this.redis([
        "XREAD",
        "COUNT",
        "100",
        "STREAMS",
        STREAM_KEY,
        this.lastId,
      ])) as [[string, [string, string[]][]]] | null;
      if (Array.isArray(result)) {
        for (const [, entries] of result) {
          for (const [id, fields] of entries) {
            this.lastId = id;
            const map: Record<string, string> = {};
            for (let i = 0; i < fields.length; i += 2) map[fields[i]] = fields[i + 1];
            if (!map.channel) continue;
            try {
              this.emit(map.channel, JSON.parse(map.data));
            } catch {
              // Bỏ qua entry hỏng
            }
          }
        }
      }
    } catch {
      // Redis chập chờn: lần poll sau tự thử lại
    } finally {
      this.polling = false;
    }
  }
}

export const notifBus = new NotificationBus();
