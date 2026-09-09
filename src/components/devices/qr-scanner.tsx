"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function QrScanner() {
  const router = useRouter();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (!scannerRef.current && scanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scannerRef.current.render(
        (decodedText) => {
          // Success callback
          setScanning(false);
          if (scannerRef.current) {
            scannerRef.current.clear();
          }
          
          toast.success("Quét mã thành công, đang chuyển hướng...");
          
          // Check if it's a full URL or just the code
          try {
            const url = new URL(decodedText);
            router.push(url.pathname);
          } catch {
            // If it's just the code
            router.push(`/dashboard/devices/qr/${decodedText}`);
          }
        },
        (error) => {
          // Ignore scanning errors, they happen continuously until a QR is found
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [scanning, router]);

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden bg-card rounded-lg border">
      <div id="reader" className="w-full"></div>
    </div>
  );
}
