interface TimelineEvent {
  event: string;
  timestamp: string;
  actor: string;
}

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative">
      <div
        className="absolute left-3 top-3 bottom-3 w-px"
        style={{ background: "var(--border)" }}
      />
      <div className="space-y-4">
        {events.map((e, i) => (
          <div key={i} className="flex gap-4 relative">
            <div
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10"
              style={{
                background:
                  i === events.length - 1 ? "var(--accent)" : "var(--card)",
                borderColor:
                  i === events.length - 1 ? "var(--accent)" : "var(--border)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background:
                    i === events.length - 1 ? "#fff" : "var(--accent)",
                }}
              />
            </div>
            <div className="pb-1">
              <div
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {e.event}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {e.timestamp}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                oleh {e.actor}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
