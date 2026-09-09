import { QrScanner } from "@/components/devices/qr-scanner";

export default function ScanPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Quét mã QR Thiết bị</h1>
      <p className="text-muted-foreground">Đưa mã QR của thiết bị vào camera để xem thông tin chi tiết.</p>
      
      <div className="py-8">
        <QrScanner />
      </div>
    </div>
  );
}
