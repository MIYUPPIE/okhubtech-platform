export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="rounded-3xl border border-white/10 bg-black/70 p-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Access denied</p>
        <h1 className="mt-4 text-3xl font-semibold">You need admin privileges to continue.</h1>
        <p className="mt-4 text-white/60">
          Please contact the OKHub operations team if you believe this is an error.
        </p>
      </div>
    </div>
  );
}
