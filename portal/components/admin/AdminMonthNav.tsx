import Link from "next/link";

function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { y: number; m: number } {
  const d = new Date(year, month - 1 + delta, 1);
  return { y: d.getFullYear(), m: d.getMonth() + 1 };
}

export function AdminMonthNav({
  basePath,
  year,
  month,
}: {
  basePath: string;
  year: number;
  month: number;
}) {
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const now = new Date();
  const q = (y: number, m: number) => `?y=${y}&m=${m}`;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Link
        href={`${basePath}${q(prev.y, prev.m)}`}
        className="rounded-md border border-white/15 px-3 py-1.5 text-[#8E8E93] hover:border-white/25 hover:text-white"
      >
        ← Prev
      </Link>
      <Link
        href={`${basePath}${q(next.y, next.m)}`}
        className="rounded-md border border-white/15 px-3 py-1.5 text-[#8E8E93] hover:border-white/25 hover:text-white"
      >
        Next →
      </Link>
      <Link
        href={`${basePath}${q(now.getFullYear(), now.getMonth() + 1)}`}
        className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-[#8E8E93] hover:text-white"
      >
        This month
      </Link>
    </div>
  );
}
