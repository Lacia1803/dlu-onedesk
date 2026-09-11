"use client";

import { TicketForm } from "@/components/tickets/ticket-form";
import { useEffect, useState } from "react";

type FAQ = { id: string; question: string; answer: string };
type Device = { id: string; name: string; qrCode: string };

export default function NewTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ deviceId?: string }>;
}) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialDeviceId, setInitialDeviceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const params = await searchParams;
        setInitialDeviceId(params.deviceId);

        const [faqsRes, devicesRes] = await Promise.all([
          fetch("/api/faqs?active=true"),
          fetch("/api/devices?all=true"),
        ]);
        if (faqsRes.ok) setFaqs(await faqsRes.json());
        if (devicesRes.ok) setDevices(await devicesRes.json());
      } catch (e) {
        console.error("Failed to load data for new ticket", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  if (loading) return <div className="p-4">Đang tải...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Tạo Ticket (Báo cáo sự cố)</h1>
      <TicketForm devices={devices} initialDeviceId={initialDeviceId} faqs={faqs} />
    </div>
  );
}

// ponytail: Server-side DB fetch removed to avoid Prisma connection during Docker build.
// Upgrade path: revert to async server component + add `output: 'standalone'` in next.config.ts if needed.
