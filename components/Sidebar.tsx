'use client';

interface Props {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
  onOpenSettings?: () => void;
}

const NAV_ITEMS = [
  {
    label: 'Home',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    )
  },
  {
    label: 'My Classroom',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h16" />
        <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" />
      </svg>
    )
  },
  {
    label: 'Assignments',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    )
  },
  {
    label: 'Exams',
    active: true,
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
      </svg>
    )
  },
  {
    label: 'My Library',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  }
];

export default function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onToggleCollapse,
  onCloseMobile,
  onOpenSettings
}: Props) {
  const sidebarContent = (
    <div className="flex h-full w-full flex-col justify-between p-4">
      <div>
        {/* Header Logo */}
        <div className="flex items-center justify-between px-1 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white font-bold text-lg shadow-sm">
              V
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">VedaAI</span>
          </div>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
              title="Collapse sidebar"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>
          )}

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="flex md:hidden h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
              title="Close menu"
            >
              ✕
            </button>
          )}
        </div>

        {/* AI Teacher's Toolkit Pill Button */}
        <button className="mb-6 w-full rounded-full bg-gray-900 border-2 border-orange-500/90 px-4 py-2.5 text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-2 transition hover:bg-gray-800 cursor-pointer">
          <span className="text-orange-400">✦</span> AI Teacher&apos;s Toolkit
        </button>

        {/* Nav list */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs cursor-pointer transition ${
                item.active
                  ? 'bg-gray-100/90 font-bold text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="space-y-3">
        <button
          onClick={onOpenSettings}
          className="flex w-full items-center gap-2.5 rounded-xl border border-gray-200/70 bg-gray-50/70 px-3.5 py-2 text-xs text-gray-600 hover:bg-gray-100 transition cursor-pointer"
        >
          <span className="text-sm">⚙️</span>
          <span className="font-medium">Settings &amp; Groq API</span>
        </button>

        <div className="flex items-center gap-3 rounded-xl bg-gray-50/90 p-2.5 border border-gray-100">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold text-xs">
            DPS
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-semibold text-gray-900">Delhi Public School</p>
            <p className="truncate text-[11px] text-gray-400">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-72 max-w-[80vw] bg-white shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      {collapsed ? (
        <aside className="hidden md:flex w-[72px] shrink-0 flex-col items-center justify-between border-r border-gray-200/80 bg-white py-5 px-2 transition-all">
          <div className="flex flex-col items-center gap-6">
            {/* VedaAI Logo Icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white font-bold text-lg shadow-sm">
              V
            </div>

            {/* Sparkle Toolkit Icon */}
            <button
              title="AI Teacher's Toolkit"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-orange-400 ring-2 ring-orange-500/80 shadow-sm transition hover:scale-105"
            >
              <span className="text-sm">✦</span>
            </button>

            {/* Nav Icons */}
            <nav className="flex flex-col items-center gap-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  title={item.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                    item.active
                      ? 'bg-gray-100 text-gray-900 shadow-2xs font-semibold'
                      : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  {item.icon}
                </button>
              ))}
            </nav>
          </div>

          {/* Bottom Area */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={onOpenSettings}
              title="Settings"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            >
              ⚙️
            </button>

            {/* School Crest Thumbnail */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-sm" title="Delhi Public School">
              🏫
            </div>

            {/* Expand Button */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                title="Expand sidebar"
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
              >
                »
              </button>
            )}
          </div>
        </aside>
      ) : (
        <aside className="hidden md:flex w-64 shrink-0 flex-col justify-between border-r border-gray-200/80 bg-white transition-all">
          {sidebarContent}
        </aside>
      )}
    </>
  );
}
