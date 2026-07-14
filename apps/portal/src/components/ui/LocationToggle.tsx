"use client";

interface LocationToggleProps {
  mode: "region" | "gps";
  onModeChange: (mode: "region" | "gps") => void;
  disabled?: boolean;
}

export function LocationToggle({
  mode,
  onModeChange,
  disabled,
}: LocationToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        type="button"
        onClick={() => onModeChange("region")}
        disabled={disabled}
        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
          mode === "region"
            ? "bg-white text-green-700 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        } disabled:opacity-50`}
      >
        <span className="flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
          Region
        </span>
      </button>
      <button
        type="button"
        onClick={() => onModeChange("gps")}
        disabled={disabled}
        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
          mode === "gps"
            ? "bg-white text-green-700 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        } disabled:opacity-50`}
      >
        <span className="flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9 9 0 100-18 9 9 0 000 18z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2m0 14v2m-7-9H3m18 0h-2m-2.93-6.07l-1.41 1.41M6.34 17.66l-1.41 1.41m0-13.14l1.41 1.41m11.32 11.32l1.41 1.41"
            />
          </svg>
          GPS Radius
        </span>
      </button>
    </div>
  );
}
