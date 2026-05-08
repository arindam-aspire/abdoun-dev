type PrintLegalPdfOptions = {
  title: string;
  contentSelector: string;
};

export function printLegalPdfFromDom({ title, contentSelector }: PrintLegalPdfOptions): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const source = document.querySelector<HTMLElement>(contentSelector);
  if (!source) return;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const printDoc = iframe.contentWindow?.document;
  if (!printDoc) {
    iframe.remove();
    return;
  }

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      @page { size: A4; margin: 14mm 12mm; }
      html, body { margin: 0; padding: 0; background: #fff; color: #111827; font-family: Inter, Arial, sans-serif; }
      .print-shell { color: #111827; font-size: 11.5pt; line-height: 1.6; }
      .print-shell .legal-download-header { margin-bottom: 16pt; border-bottom: 1px solid #d1d5db; padding-bottom: 10pt; text-align: center; }
      .print-shell .legal-download-logo { display: flex; justify-content: center; margin-bottom: 8pt; }
      .print-shell .legal-download-header h1 { margin: 0 0 6pt; color: #0f172a; font-size: 19pt; line-height: 1.25; }
      .print-shell .legal-download-header p { margin: 0; color: #1f2937; }
      .print-shell .legal-download-updated { margin-top: 6pt; font-size: 10.5pt; color: #374151; }
      .print-shell .legal-download-content section { break-inside: avoid; page-break-inside: avoid; border-bottom: 1px solid #d1d5db; padding-bottom: 12pt; margin-bottom: 12pt; }
      .print-shell .legal-download-content section:last-child { border-bottom: 0; padding-bottom: 0; margin-bottom: 0; }
      .print-shell .legal-download-content section h2 { color: #0f172a; font-size: 14pt; line-height: 1.3; margin: 0 0 6pt; }
      .print-shell .legal-download-content section p, .print-shell .legal-download-content section li { margin: 0 0 6pt; color: #1f2937; }
      .print-shell .legal-download-content section a { color: #111827; text-decoration: none; }
    </style>
  </head>
  <body>
    <main class="print-shell">${source.outerHTML}</main>
  </body>
</html>`;

  printDoc.open();
  printDoc.write(html);
  printDoc.close();

  const printWindow = iframe.contentWindow;
  if (!printWindow) {
    iframe.remove();
    return;
  }

  const cleanup = () => {
    iframe.remove();
  };

  const onLoad = () => {
    printWindow.focus();
    printWindow.print();
    window.setTimeout(cleanup, 800);
  };

  if (iframe.contentDocument?.readyState === "complete") {
    onLoad();
    return;
  }

  iframe.onload = onLoad;
}
