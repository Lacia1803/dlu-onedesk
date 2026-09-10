import { BrowserFrame } from "./ui-bits";
import { IMAGES } from "./data";

export function DashboardMockup() {
  return (
    <BrowserFrame url="onedesk.dlu.edu.vn/tong-quan">
      <img
        src={IMAGES.realDashboard}
        alt="Dashboard thực tế"
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </BrowserFrame>
  );
}

export function TicketDetailMockup() {
  return (
    <BrowserFrame url="onedesk.dlu.edu.vn/tickets">
      <img
        src={IMAGES.realTickets}
        alt="Danh sách Ticket thực tế"
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </BrowserFrame>
  );
}

export function DevicesMockup() {
  return (
    <BrowserFrame url="onedesk.dlu.edu.vn/devices">
      <img
        src={IMAGES.realDevices}
        alt="Quản lý thiết bị thực tế"
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </BrowserFrame>
  );
}

export function ChatMockup() {
  return (
    <BrowserFrame url="onedesk.dlu.edu.vn/faq">
      <img
        src={IMAGES.realFaq}
        alt="Trợ lý AI & FAQ thực tế"
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </BrowserFrame>
  );
}

export function KpiMockup() {
  return (
    <BrowserFrame url="onedesk.dlu.edu.vn/kpi">
      <img
        src={IMAGES.realKpi}
        alt="Báo cáo KPI thực tế"
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </BrowserFrame>
  );
}

export function MockupByKey({ k }: { k: "ticket" | "devices" | "chat" | "kpi" }) {
  switch (k) {
    case "ticket":
      return <TicketDetailMockup />;
    case "devices":
      return <DevicesMockup />;
    case "chat":
      return <ChatMockup />;
    case "kpi":
      return <KpiMockup />;
  }
}
