"use client";

import { useState } from "react";
import { MaintenanceCalendar } from "@/components/maintenance/maintenance-calendar";
import { TechnicianTicketList } from "@/components/maintenance/technician-ticket-list";

export interface LogItem {
  id: string;
  type: string;
  description: string;
  cost: number | null;
  performedAt: Date | string;
  deviceId: string;
  device: { name: string; room: { name: string } };
  technician: { name: string | null };
}

export interface TicketItem {
  id: string;
  title: string;
  scheduledAt: Date | string | null;
  device: { name: string } | null;
  status: "OPEN" | "IN_PROGRESS" | "WAITING_PARTS" | "RESOLVED" | "CANCELLED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: Date;
}

interface Props {
  isTech: boolean;
  logs: LogItem[];
  myTickets: TicketItem[];
  scheduledTickets: TicketItem[];
}

export function MaintenanceDashboardClient({ isTech, logs, myTickets, scheduledTickets }: Props) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id === selectedTicketId ? null : id); // toggle
  };

  return (
    <>
      {isTech && myTickets.length > 0 && (
        <TechnicianTicketList
          tickets={myTickets}
          selectedTicketId={selectedTicketId || undefined}
          onSelectTicket={handleSelectTicket}
        />
      )}

      <MaintenanceCalendar
        initialLogs={logs}
        scheduledTickets={scheduledTickets}
        selectedTicketId={selectedTicketId}
        onClearSelectedTicket={() => setSelectedTicketId(null)}
      />
    </>
  );
}
