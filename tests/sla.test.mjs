import assert from "node:assert";
import { describe, it } from "node:test";
import { computeSlaDeadline, isOverdue, isValidTransition } from "../src/lib/ticket-actions.ts";

// Prisma enums are plain strings at runtime in this context
const TicketStatus = { OPEN: "OPEN", IN_PROGRESS: "IN_PROGRESS", WAITING_PARTS: "WAITING_PARTS", RESOLVED: "RESOLVED", CLOSED: "CLOSED" };
const TicketPriority = { URGENT: "URGENT", HIGH: "HIGH", MEDIUM: "MEDIUM", LOW: "LOW" };

describe("SLA Calculations", () => {
  it("URGENT ticket has 4-hour SLA deadline", () => {
    const now = new Date("2026-09-10T08:00:00Z");
    const deadline = computeSlaDeadline(TicketPriority.URGENT, now);
    assert.deepStrictEqual(deadline, new Date("2026-09-10T12:00:00Z"));
  });

  it("HIGH ticket has 8-hour SLA deadline", () => {
    const now = new Date("2026-09-10T08:00:00Z");
    const deadline = computeSlaDeadline(TicketPriority.HIGH, now);
    assert.deepStrictEqual(deadline, new Date("2026-09-10T16:00:00Z"));
  });

  it("MEDIUM ticket has 24-hour SLA deadline", () => {
    const now = new Date("2026-09-10T08:00:00Z");
    const deadline = computeSlaDeadline(TicketPriority.MEDIUM, now);
    assert.deepStrictEqual(deadline, new Date("2026-09-11T08:00:00Z"));
  });

  it("LOW ticket has 72-hour SLA deadline", () => {
    const now = new Date("2026-09-10T08:00:00Z");
    const deadline = computeSlaDeadline(TicketPriority.LOW, now);
    assert.deepStrictEqual(deadline, new Date("2026-09-13T08:00:00Z"));
  });
});

describe("SLA Overdue Detection", () => {
  it("CLOSED ticket is never overdue", () => {
    assert.strictEqual(isOverdue({ status: TicketStatus.CLOSED, slaDeadline: new Date(Date.now() - 1000) }), false);
  });

  it("ticket without slaDeadline is not overdue", () => {
    assert.strictEqual(isOverdue({ status: TicketStatus.OPEN, slaDeadline: null }), false);
  });

  it("ticket past deadline is overdue", () => {
    assert.strictEqual(isOverdue({ status: TicketStatus.OPEN, slaDeadline: new Date(Date.now() - 1000) }), true);
  });

  it("ticket with future deadline is not overdue", () => {
    assert.strictEqual(isOverdue({ status: TicketStatus.OPEN, slaDeadline: new Date(Date.now() + 3600000) }), false);
  });
});

describe("Ticket Transition Validation", () => {
  it("OPEN can transition to IN_PROGRESS or CLOSED", () => {
    assert.strictEqual(isValidTransition(TicketStatus.OPEN, TicketStatus.IN_PROGRESS), true);
    assert.strictEqual(isValidTransition(TicketStatus.OPEN, TicketStatus.CLOSED), true);
    assert.strictEqual(isValidTransition(TicketStatus.OPEN, TicketStatus.RESOLVED), false);
  });

  it("IN_PROGRESS can transition to WAITING_PARTS or RESOLVED", () => {
    assert.strictEqual(isValidTransition(TicketStatus.IN_PROGRESS, TicketStatus.WAITING_PARTS), true);
    assert.strictEqual(isValidTransition(TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED), true);
    assert.strictEqual(isValidTransition(TicketStatus.IN_PROGRESS, TicketStatus.OPEN), false);
  });

  it("RESOLVED can only transition to CLOSED", () => {
    assert.strictEqual(isValidTransition(TicketStatus.RESOLVED, TicketStatus.CLOSED), true);
    assert.strictEqual(isValidTransition(TicketStatus.RESOLVED, TicketStatus.OPEN), false);
  });

  it("CLOSED has no valid transitions", () => {
    assert.strictEqual(isValidTransition(TicketStatus.CLOSED, TicketStatus.OPEN), false);
    assert.strictEqual(isValidTransition(TicketStatus.CLOSED, TicketStatus.IN_PROGRESS), false);
  });
});

// ponytail: node --test runner, zero deps. Upgrade path: add integration tests for race conditions when CI is set up.
