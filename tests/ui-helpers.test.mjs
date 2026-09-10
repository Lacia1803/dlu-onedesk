import { test } from "node:test";
import assert from "node:assert";

/* Test parser link [text](url) của chat widget — mirror logic renderBotText */

function botLinkSegments(text) {
  return text.split(/(\[[^\]]+\]\([^)]+\))/g);
}

function parseBotLink(part) {
  const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  return m ? { label: m[1], href: m[2] } : null;
}

test("tách chuỗi chứa 1 link markdown thành 3 đoạn", () => {
  const segs = botLinkSegments("Bạn cần hỗ trợ? [tạo ticket](/dashboard/tickets/new) nhé");
  assert.equal(segs.length, 3);
  assert.equal(segs[0], "Bạn cần hỗ trợ? ");
  const link = parseBotLink(segs[1]);
  assert.deepEqual(link, { label: "tạo ticket", href: "/dashboard/tickets/new" });
  assert.equal(segs[2], " nhé");
});

test("văn bản thường không match link", () => {
  assert.equal(parseBotLink("chỉ là text"), null);
  assert.equal(parseBotLink("[missing"), null);
});

test("chuỗi không có link không bị tách", () => {
  const segs = botLinkSegments("Câu trả lời bình thường, không có markdown");
  assert.equal(segs.length, 1);
});

test("nhiều link trong 1 câu vẫn tách đúng", () => {
  const segs = botLinkSegments("A [x](/x) giữa B [y](/y) cuối");
  const links = segs.map(parseBotLink).filter(Boolean);
  assert.equal(links.length, 2);
  assert.deepEqual(links[0], { label: "x", href: "/x" });
  assert.deepEqual(links[1], { label: "y", href: "/y" });
});
