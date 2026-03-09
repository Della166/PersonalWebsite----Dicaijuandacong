import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold text-[var(--text)]">404</h1>
      <p className="text-[var(--text-muted)]">Page not found.</p>
      <Link href="/" className="text-[var(--primary)] hover:underline">
        Back to home
      </Link>
    </div>
  );
}
