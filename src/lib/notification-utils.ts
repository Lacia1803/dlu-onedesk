// Pure helpers cho notifications — giữ riêng khỏi "use server" để import được vào client/test.
export const NOTIFICATION_PAGE_SIZE = 20;

export function notificationPageSkip(page: number, pageSize = NOTIFICATION_PAGE_SIZE) {
  const p = Math.max(1, Math.floor(page) || 1);
  return (p - 1) * pageSize;
}
