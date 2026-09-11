import Image from "next/image";
import { BrowserFrame } from "./ui-bits";
import { IMAGES } from "./data";

export function DashboardMockup() {
  return (
    <BrowserFrame url="onedesk.dlu.edu.vn/tong-quan">
      <Image
        src={IMAGES.realDashboard}
        alt="Dashboard thực tế"
        width={1200}
        height={700}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </BrowserFrame>
  );
}

export function TicketDetailMockup() {
  return (
    <BrowserFrame url="onedesk.dlu.edu.vn/tickets">
      <Image
        src={IMAGES.realTickets}
        alt="Danh sách Ticket thực tế"
        width={1200}
        height={700}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </BrowserFrame>
  );
}

export function DevicesMockup() {
  return (
    <BrowserFrame url="onedesk.dlu.edu.vn/devices">
      <Image
        src={IMAGES.realDevices}
        alt="Quản lý thiết bị thực tế"
        width={1200}
        height={700}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </BrowserFrame>
  );
}

export function ChatMockup() {
  return (
    <BrowserFrame url="onedesk.dlu.edu.vn/faq">
      <Image
        src={IMAGES.realFaq}
        alt="Trợ lý AI & FAQ thực tế"
        width={1200}
        height={700}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </BrowserFrame>
  );
}

export function KpiMockup() {
  return (
    <BrowserFrame url="onedesk.dlu.edu.vn/kpi">
      <Image
        src={IMAGES.realKpi}
        alt="Báo cáo KPI thực tế"
        width={1200}
        height={700}
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
