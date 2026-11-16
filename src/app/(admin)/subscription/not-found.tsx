export default function PlanNotFound() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-6">
      <h1 className="text-lg font-semibold">No subscription plan yet</h1>
      <p className="text-sm text-ink-2">
        The monthly plan hasn&apos;t been set up on the server. Run the backend
        seed to create it, then reload.
      </p>
    </div>
  );
}
