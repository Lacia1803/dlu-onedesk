import { EventEmitter } from "events";

/**
 * Simple in‑process event bus used for Server‑Sent Events (SSE).
 * In a multi‑instance deployment you would replace this with a Redis
 * pub/sub or a dedicated message broker.
 */
export const notifBus = new EventEmitter();
