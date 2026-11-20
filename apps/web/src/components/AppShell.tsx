import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Search,
  Shield,
  Sun,
  Moon,
  CircleHelp,
  ChevronRight,
  Settings,
  Sparkles,
  Cpu,
  Gauge,
  KeyRound,
  Workflow,
  Lock,
} from "lucide-react";
import { NAVIGATION, TOP_NAVIGATION } from "../app/navigation.js";
import type { ApiHealth, PageId } from "../app/types.js";

interface AppShellProps {
  readonly page: PageId;
  readonly onNavigate: (page: PageId) => void;
  readonly theme: "light" | "dark";
  readonly onToggleTheme: () => void;
  readonly api: ApiHealth | null;
  readonly apiError: string;
  readonly children: ReactNode;
  readonly rightPanel: ReactNode;
  readonly bottomPanels: ReactNode;
}

const TOP_GROUPS: Record<string, readonly PageId[]> = {
  Generate: ["generator"],
  Analyze: ["analysis"],
  Policy: ["policy"],
  Reuse: ["reuse"],
  "Research Lab": ["hashing", "attack", "benchmarks", "reports", "topology", "learning"],
};

export function BrandLogo() {
  return (
    <span className="brand-symbol" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2L3.5 5.8V11.5C3.5 16.75 7.15 21.6 12 22.8C16.85 21.6 20.5 16.75 20.5 11.5V5.8L12 2Z"
          fill="url(#shield-gradient)"
          stroke="#3b82f6"
          strokeWidth="1.2"
        />
        <path
          d="M12 6.2L6.5 8.8V12.5C6.5 15.8 8.85 18.9 12 19.8C15.15 18.9 17.5 15.8 17.5 12.5V8.8L12 6.2Z"
          fill="rgba(255, 255, 255, 0.24)"
          stroke="#ffffff"
          strokeWidth="1"
        />
        <defs>
          <linearGradient id="shield-gradient" x1="3.5" y1="2" x2="20.5" y2="22.8" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#0958d9" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

export function AppShell({
  page,
  onNavigate,
  theme,
  onToggleTheme,
  api,
  apiError,
  children,
  rightPanel,
  bottomPanels,
}: AppShellProps) {
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return [];
    return NAVIGATION.filter((item) =>
      `${item.label} ${item.description}`.toLocaleLowerCase().includes(normalized),
    ).slice(0, 5);
  }, [query]);

  const activeTop = TOP_NAVIGATION.find((item) => TOP_GROUPS[item.label]?.includes(page))?.label;

  function selectSearchResult(result: (typeof NAVIGATION)[number] | undefined) {
    if (!result) return;
    onNavigate(result.id);
    setQuery("");
  }

  const memoryPercent = api && api.hostMemoryBytes > 0
    ? Math.min(100, (api.processMemoryBytes / api.hostMemoryBytes) * 100)
    : 0;

  const isOverview = page === "overview";

  return (
    <div className={`application theme-${theme}`}>
      {/* 1. Apple macOS Unified Toolbar / Header */}
      <header className="global-header">
        <div className="header-left-zone">
          {isOverview ? (
            <div className="header-page-title" role="heading" aria-level={1}>
              <span>Home</span>
            </div>
          ) : (
            <div className="product-brand" role="banner" onClick={() => onNavigate("overview")} style={{ cursor: "pointer" }}>
              <BrandLogo />
              <div className="brand-copy">
                <strong>Password Security Laboratory</strong>
                <small>A Hands-On Information Security Lab</small>
              </div>
            </div>
          )}
        </div>

        {/* Center Top Segmented Navigation (Visible on Lab Workbenches as shown in Reference 2) */}
        {!isOverview ? (
          <nav className="top-navigation" aria-label="Product sections">
            {TOP_NAVIGATION.map((item) => (
              <button
                type="button"
                key={item.label}
                className={`top-nav-link ${activeTop === item.label ? "is-active" : ""}`}
                aria-current={activeTop === item.label ? "page" : undefined}
                onClick={() => onNavigate(item.page)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        ) : (
          <div className="header-center-spacer" aria-hidden="true" />
        )}

        {/* Right Tools: Search [Ctrl K], Settings, Theme Switcher, Session Badge */}
        <div className="header-tools">
          <div className="global-search">
            <Search size={13} className="search-icon" aria-hidden="true" />
            <input
              ref={searchInput}
              aria-label="Search laboratory modules"
              placeholder="Search modules..."
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") selectSearchResult(results[0]);
                if (event.key === "Escape") setQuery("");
              }}
            />
            <kbd>Ctrl K</kbd>
            {query && (
              <div className="search-results" role="listbox" aria-label="Matching modules">
                {results.length > 0 ? (
                  results.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        type="button"
                        role="option"
                        key={item.id}
                        onClick={() => selectSearchResult(item)}
                      >
                        <Icon size={15} aria-hidden="true" />
                        <span>
                          <strong>{item.label}</strong>
                          <small>{item.description}</small>
                        </span>
                        <ChevronRight size={13} aria-hidden="true" />
                      </button>
                    );
                  })
                ) : (
                  <p>No module matches “{query}”. Search covers module names and descriptions only.</p>
                )}
              </div>
            )}
          </div>

          <button
            className="icon-action"
            type="button"
            aria-label="Settings"
            title="Settings"
            onClick={() => onNavigate("overview")}
          >
            <Settings size={15} />
          </button>

          <button
            className="icon-action"
            type="button"
            onClick={onToggleTheme}
            aria-label={`Settings: switch to ${theme === "light" ? "dark" : "light"} theme`}
            title="Toggle theme appearance"
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          <div className="local-session-badge" title="All personal password processing occurs locally on this device">
            <span className="session-dot is-online" />
            <span>Local Session</span>
          </div>
        </div>
      </header>

      {/* 2. Apple macOS Split Window: Source List Sidebar + Primary Canvas */}
      <div className="application-body">
        <aside className="sidebar" aria-label="Laboratory navigation">
          {/* Top Sidebar Brand Header (Shown when on Home Overview matching Reference 1) */}
          <div className="sidebar-brand-header">
            <BrandLogo />
            <div className="brand-copy">
              <strong>Password Security Laboratory</strong>
              <small>Information Security Lab</small>
            </div>
          </div>

          <div className="sidebar-heading">
            <span>WORKBENCH</span>
            <span className="side-mode-badge">Local</span>
          </div>

          {/* Group 1: Personal Password Tools (Client-Local Browser Memory) */}
          <div className="navigation-group">
            <h2>PERSONAL PASSWORD TOOLS</h2>
            <nav aria-label="PERSONAL PASSWORD TOOLS">
              {NAVIGATION.filter((item) => item.group === "PERSONAL PASSWORD TOOLS").map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`sidebar-link ${page === item.id ? "is-active" : ""}`}
                    aria-current={page === item.id ? "page" : undefined}
                    title={item.description}
                    onClick={() => onNavigate(item.id)}
                  >
                    <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Group 2: Research Lab (Server Synthetic Fixtures) */}
          <div className="navigation-group">
            <h2>RESEARCH LAB</h2>
            <nav aria-label="RESEARCH LAB">
              {NAVIGATION.filter((item) => item.group === "RESEARCH LAB" && !["overview", "topology", "learning"].includes(item.id)).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`sidebar-link ${page === item.id ? "is-active" : ""}`}
                    aria-current={page === item.id ? "page" : undefined}
                    title={item.description}
                    onClick={() => onNavigate(item.id)}
                  >
                    <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Group 3: Platform & Learning */}
          <div className="navigation-group">
            <h2>LEARN</h2>
            <nav aria-label="LEARN">
              {NAVIGATION.filter((item) => ["overview", "topology", "learning"].includes(item.id)).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`sidebar-link ${page === item.id ? "is-active" : ""}`}
                    aria-current={page === item.id ? "page" : undefined}
                    title={item.description}
                    onClick={() => onNavigate(item.id)}
                  >
                    <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Clean Local Laboratory Resource Status Card */}
          <div className="sidebar-resource-card">
            <div className="resource-heading">
              <span>LAB RESOURCES</span>
              <CircleHelp size={13} aria-label="Live service measurements from the local Python API" />
            </div>
            <div className="resource-state">
              <span className={`service-dot ${api ? "is-online" : "is-offline"}`} />
              <span>{api ? "Local API online" : apiError ? "Local API unavailable" : "Checking local API"}</span>
            </div>
            {api ? (
              <div className="resource-body">
                <div className="resource-row">
                  <span>Host CPU</span>
                  <strong>{api.cpuPercent.toFixed(1)}%</strong>
                </div>
                <div
                  className="meter"
                  role="meter"
                  aria-label="Host CPU usage"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(api.cpuPercent)}
                >
                  <span style={{ width: `${Math.max(0, Math.min(api.cpuPercent, 100))}%` }} />
                </div>
                <div className="resource-row">
                  <span>API process memory</span>
                  <strong>{formatBytes(api.processMemoryBytes)}</strong>
                </div>
                <div
                  className="meter meter-cyan"
                  role="meter"
                  aria-label="Laboratory process memory"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(memoryPercent)}
                >
                  <span style={{ width: `${memoryPercent}%` }} />
                </div>
                <div className="resource-row">
                  <span>Active experiments</span>
                  <strong>{api.activeExperiments}</strong>
                </div>
              </div>
            ) : (
              <p className="resource-unavailable">Live metrics appear when the loopback API responds.</p>
            )}
            <div className="sidebar-privacy">
              <Shield size={13} aria-hidden="true" />
              <span>Analysis stays in this browser tab.</span>
            </div>
          </div>

          {/* Bottom Session Device Card matching Reference 1 & Reference 2 */}
          <div className="sidebar-bottom-device" onClick={() => onNavigate("overview")} role="button" tabIndex={0} style={{ cursor: "pointer" }}>
            <div className="device-status-icon">
              <span className="session-dot is-online" />
            </div>
            <div className="device-status-info">
              <strong>Local Session</strong>
              <small>All processing on this device</small>
            </div>
            <ChevronRight size={14} className="device-chevron" aria-hidden="true" />
          </div>
        </aside>

        {/* Primary Workspace Area */}
        <div className="work-area">
          <div className="work-top">
            <main className="workspace" id="main-content" tabIndex={-1}>
              {children}
            </main>
            {/* The Operations rail is rendered cleanly in DOM for accessibility, collapsed to 0px so workspace gets full canvas */}
            <aside className="operations-rail is-collapsed" aria-label="Laboratory operations">
              {rightPanel}
            </aside>
          </div>
          {/* Lower 3-card operational dock is shown on workbench pages (like Analysis), hidden on Home Overview */}
          <section className={`lower-panels ${isOverview ? "is-hidden-on-overview" : ""}`} aria-label="Laboratory status and actions">
            {bottomPanels}
          </section>
        </div>
      </div>

      <footer className="status-bar" aria-label="Application status">
        <div>
          <span className={`status-indicator ${api ? "is-online" : apiError ? "is-offline" : "is-checking"}`} />
          {api ? "LAB READY" : apiError ? "LOCAL API UNAVAILABLE" : "CHECKING LOCAL API"}
        </div>
        <span className="status-divider" />
        <span>{api ? "PYTHON SERVICE RESPONDING" : apiError ? "START API FROM LOCAL TERMINAL" : "HEALTH CHECK IN PROGRESS"}</span>
        <span className="status-spacer" />
        <span>NO ANALYTICS</span>
        <span className="status-divider" />
        <span>ZERO TELEMETRY</span>
        <span className="status-divider" />
        <span>EDUCATIONAL MODE</span>
      </footer>
    </div>
  );
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "Unavailable";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KiB", "MiB", "GiB", "TiB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}
