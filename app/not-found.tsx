import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      <FileQuestion className="h-12 w-12 text-indigo-500" />
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-slate-500">
        This page does not exist in the service desk.
      </p>
      <Link className="btn-primary" href="/dashboard">
        Back to dashboard
      </Link>
    </main>
  );
}
