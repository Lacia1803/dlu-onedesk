"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QrCodeDisplayProps {
  qrCode: string;
  deviceName: string;
}

export function QrCodeDisplay({ qrCode, deviceName }: QrCodeDisplayProps) {
  const [qrSrc, setQrSrc] = useState<string>("");

  useEffect(() => {
    // Generate URL that points to the scan redirect page
    const scanUrl = `${window.location.origin}/dashboard/devices/qr/${qrCode}`;
    
    QRCode.toDataURL(scanUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => {
        setQrSrc(url);
      })
      .catch((err) => {
        console.error("Lỗi tạo QR:", err);
      });
  }, [qrCode]);

  if (!qrSrc) return <div className="h-[300px] w-[300px] animate-pulse bg-muted rounded-md" />;

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-card max-w-sm">
      <h3 className="font-medium text-lg text-center">{deviceName}</h3>
      <img src={qrSrc} alt={`QR Code cho ${deviceName}`} className="w-full h-auto rounded-md border" />
      <div className="text-xs text-muted-foreground break-all bg-muted p-2 rounded w-full text-center">
        {qrCode}
      </div>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => {
          const a = document.createElement("a");
          a.href = qrSrc;
          a.download = `QR-${deviceName.replace(/\s+/g, '-')}-${qrCode}.png`;
          a.click();
        }}
      >
        <Download className="mr-2 h-4 w-4" />
        Tải mã QR
      </Button>
    </div>
  );
}
