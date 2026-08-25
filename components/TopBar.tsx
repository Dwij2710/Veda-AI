'use client';

interface Props {
  onBack?: () => void;
  onOpenSettings?: () => void;
}

export default function TopBar({ onBack, onOpenSettings }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200/80 bg-white px-6">
      {/* Left Back / Navigation */}
      <div className="flex items-center gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg py-1 px-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="flex items-center gap-1.5 text-gray-800">
              <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" />
              </svg>
              Exams
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
            <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" />
            </svg>
            <span>Exams</span>
          </div>
        )}
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-4">
        {/* Help */}
        <button
          title="Help & Documentation"
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>

        {/* Notifications with red 0 badge */}
        <div className="relative">
          <button
            title="Notifications"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-orange-600 text-[9px] font-bold text-white">
            0
          </span>
        </div>

        {/* AI Sparkle */}
        <button
          onClick={onOpenSettings}
          title="Groq AI Settings"
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
        >
          <span className="text-sm">✦</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white">
            MR
          </div>
          <span className="text-xs font-semibold text-gray-800">Madhur Rastogi</span>
          <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </header>
  );
}
