import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Printer, QrCode } from 'lucide-react';

interface TableQRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableCount: number;
  restaurantName: string;
}

export function TableQRCodeModal({
  open,
  onOpenChange,
  tableCount,
  restaurantName,
}: TableQRCodeModalProps) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const baseUrl = window.location.origin;

  const getTableUrl = (tableNumber: number) => {
    return `${baseUrl}/?table=${tableNumber}`;
  };

  const handleDownload = (tableNumber: number) => {
    const svg = document.getElementById(`qr-${tableNumber}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 350;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 25, 25, 250, 250);
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(`Table ${tableNumber}`, canvas.width / 2, 310);
      }

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `table-${tableNumber}-qr.png`;
      downloadLink.href = pngUrl;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrCodes = Array.from({ length: tableCount }, (_, i) => i + 1)
      .map((tableNumber) => {
        const svg = document.getElementById(`qr-${tableNumber}`);
        if (!svg) return '';
        const svgData = new XMLSerializer().serializeToString(svg);
        return `
          <div style="page-break-inside: avoid; text-align: center; padding: 20px; border: 1px dashed #ccc; margin: 10px;">
            <div style="margin-bottom: 10px;">${svgData}</div>
            <div style="font-family: Inter, sans-serif; font-size: 18px; font-weight: bold;">Table ${tableNumber}</div>
            <div style="font-family: Inter, sans-serif; font-size: 12px; color: #666; margin-top: 4px;">${restaurantName}</div>
            <div style="font-family: Inter, sans-serif; font-size: 10px; color: #999; margin-top: 8px;">Scan to view menu</div>
          </div>
        `;
      })
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - ${restaurantName}</title>
          <style>
            body { font-family: Inter, sans-serif; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 20px; }
            @media print {
              .grid { grid-template-columns: repeat(2, 1fr); }
            }
          </style>
        </head>
        <body>
          <div class="grid">${qrCodes}</div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Table QR Codes
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between py-2">
          <p className="text-sm text-muted-foreground">
            Generate QR codes for {tableCount} tables. Each code links directly to the menu.
          </p>
          <Button onClick={handlePrintAll} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print All
          </Button>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div ref={printRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: tableCount }, (_, i) => i + 1).map((tableNumber) => (
              <div
                key={tableNumber}
                className="flex flex-col items-center p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors"
              >
                <QRCodeSVG
                  id={`qr-${tableNumber}`}
                  value={getTableUrl(tableNumber)}
                  size={120}
                  level="H"
                  includeMargin
                  className="rounded-lg"
                />
                <p className="mt-2 font-semibold text-lg">Table {tableNumber}</p>
                <p className="text-xs text-muted-foreground mb-3 text-center break-all max-w-[140px]">
                  {getTableUrl(tableNumber)}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(tableNumber)}
                  className="w-full"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
