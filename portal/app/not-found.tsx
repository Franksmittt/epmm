import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
      <h1 className="text-xl font-semibold text-white">Page not found</h1>
      <p className="text-sm text-[#8E8E93]">
        This link is not valid or the client does not exist.
      </p>
      <Link
        href="/login"
        className="rounded-md border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5"
      >
        Back to login
      </Link>
    </div>
  );
}
