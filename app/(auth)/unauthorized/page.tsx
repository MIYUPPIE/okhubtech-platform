export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="rounded-3xl border border-black/10 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-black/70 dark:shadow-none">
        <p className="text-xs uppercase tracking-[0.3em] text-black/50 dark:text-white/50">Access denied</p>
        <h1 className="mt-4 text-3xl font-semibold">You need admin privileges to continue.</h1>
        <p className="mt-4 text-black/60 dark:text-white/60">
          Please contact the OKHub operations team if you believe this is an error.
        </p>
      </div>
    </div>
  );
}
