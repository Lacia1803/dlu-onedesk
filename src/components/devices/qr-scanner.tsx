"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye, AlertTriangle } from "lucide-react";

export function QrScanner() {
  const router = useRouter();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanning, setScanning] = useState(true);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);

  useEffect(() => {
    if (!scannerRef.current && scanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scannerRef.current.render(
        (decodedText) => {
          setScanning(false);
          if (scannerRef.current) {
            scannerRef.current.clear();
          }

          toast.success("Quét mã thành công!");

          // Resolve QR code -> device id via lookup API
          let code = decodedText;
          try {
            const url = new URL(decodedText);
            const parts = url.pathname.split("/");
            code = parts[parts.length - 1];
          } catch {
            // raw code
          }

          fetch(`/api/devices/lookup?code=${encodeURIComponent(code)}`)
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not found"))))
            .then((data: { id: string; name: string }) => {
              setDeviceId(data.id);
              setDeviceName(data.name);
            })
            .catch(() => toast.error("Không tìm thấy thiết bị cho mã này."));
        },
        () => {}
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [scanning, router]);

  // After scan: show options
  if (deviceId) {
    return (
      <div className="w-full max-w-md mx-auto bg-card rounded-lg border p-6 space-y-4 text-center">
        <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
          <Eye className="h-5 w-5" />
          Đã nhận diện thiết bị
        </div>
        <p className="font-semibold">{deviceName}</p>
        <div className="flex flex-col gap-2">
          <Button onClick={() => router.push(`/dashboard/devices/${deviceId}`)}>
            Xem thông tin thiết bị
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/tickets/new?deviceId=${deviceId}`)}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Báo cáo sự cố thiết bị này
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeviceId(null);
              setScanning(true);
            }}
          >
            Quét lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden bg-card rounded-lg border">
      <div id="reader" className="w-full"></div>
    </div>
  );
}
