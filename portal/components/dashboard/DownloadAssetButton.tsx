"use client";

interface DownloadAssetButtonProps {
  url: string;
  filename: string;
}

/**
 * Fetch → Blob → object URL so the browser saves the file instead of navigating
 * (cross-origin safe when the asset allows CORS, or same-origin).
 */
export function DownloadAssetButton({ url, filename }: DownloadAssetButtonProps) {
  async function onDownload(e: React.MouseEvent) {
    e.stopPropagation();
    const res = await fetch(url);
    if (!res.ok) return;
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <button
      type="button"
      onClick={onDownload}
      className="rounded-md border border-white/20 bg-black px-3 py-2 text-xs font-medium text-white"
    >
      Download
    </button>
  );
}
