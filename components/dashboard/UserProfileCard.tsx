export const UserProfileCard = () => {
  return (
    <div className="dashboard-card flex items-center gap-5">
      {/* Avatar */}
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--terminal-border)] text-xl font-bold text-foreground">
        AF
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <span className="text-lg font-semibold text-foreground">Den Dev</span>
        <span className="text-sm text-purple-100">ID: URYUE^#$^#&</span>
        <span className="mt-1 w-fit rounded px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400">
          Not Verified
        </span>
      </div>
    </div>
  );
};
