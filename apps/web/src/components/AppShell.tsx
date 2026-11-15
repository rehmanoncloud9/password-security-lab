import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Search,
  Shield,
  Sun,
  Moon,
  CircleHelp,
  ChevronRight,
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
  Lab: ["overview", "topology", "hashing", "benchmarks"],
  Experiments: ["attack", "reuse", "generator"],
  Analysis: ["analysis", "policy"],
  Reports: ["reports"],
  Learn: ["learning"],
};

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

  return (
    <div className={`application theme-${theme}`}>
      <header className="global-header">
        <div className="product-brand">
          <span className="brand-symbol" aria-hidden="true"><Shield size={19} strokeWidth={2.2} /></span>
          <span className="brand-copy">
            <strong>PASSWORD SECURITY LABORATORY</strong>
            <small>A Hands-On Information Security Lab</small>
          </span>
        </div>
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
        <div className="header-tools">
          <div className="global-search">
            <Search size={15} aria-hidden="true" />
            <input
              ref={searchInput}
              aria-label="Search laboratory modules"
              placeholder="Search modules"
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
                {results.length > 0 ? results.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button type="button" role="option" key={item.id} onClick={() => selectSearchResult(item)}>
                      <Icon size={16} aria-hidden="true" />
                      <span><strong>{item.label}</strong><small>{item.description}</small></span>
                      <ChevronRight size={14} aria-hidden="true" />
                    </button>
                  );
                }) : <p>No module matches “{query}”. Search covers module names and descriptions only.</p>}
              </div>
            )}
          </div>
          <button className="icon-action" type="button" onClick={onToggleTheme} aria-label={`Settings: switch to ${theme === "light" ? "dark" : "light"} theme`} title="Settings · appearance">
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <span className="local-session"><span className="session-dot" /> LOCAL SESSION</span>
        </div>
      </header>

      <div className="application-body">
        <aside className="sidebar" aria-label="Laboratory navigation">
          <div className="sidebar-heading"><span>WORKBENCH</span><span className="side-mode">LOCAL</span></div>
          {(["LAB WORKSPACE", "ANALYSIS & EDUCATION"] as const).map((group) => (
            <div className="navigation-group" key={group}>
              <h2>{group}</h2>
              <nav aria-label={group}>
                {NAVIGATION.filter((item) => item.group === group).map((item) => {
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
                      <Icon size={17} strokeWidth={1.85} aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
          <div className="sidebar-resource-card">
            <div className="resource-heading"><span>LAB RESOURCES</span><CircleHelp size={14} aria-label="Live service measurements from the local Python API" /></div>
            <div className="resource-state"><span className={`service-dot ${api ? "is-online" : "is-offline"}`} />{api ? "Local API online" : apiError ? "Local API unavailable" : "Checking local API"}</div>
            {api ? <>
              <div className="resource-row"><span>Host CPU</span><strong>{api.cpuPercent.toFixed(1)}%</strong></div>
              <div className="meter" role="meter" aria-label="Host CPU usage" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(api.cpuPercent)}><span style={{ width: `${Math.max(0, Math.min(api.cpuPercent, 100))}%` }} /></div>
              <div className="resource-row"><span>API process memory</span><strong>{formatBytes(api.processMemoryBytes)}</strong></div>
              <div className="meter meter-cyan" role="meter" aria-label="Laboratory process memory as a share of host memory" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(memoryPercent)}><span style={{ width: `${memoryPercent}%` }} /></div>
              <div className="resource-row"><span>Active experiments</span><strong>{api.activeExperiments}</strong></div>
            </> : <p className="resource-unavailable">Live metrics appear when the loopback API responds.</p>}
            <div className="sidebar-privacy"><Shield size={14} aria-hidden="true" /><span>Analysis stays in this browser tab.</span></div>
          </div>
        </aside>

        <div className="work-area">
          <div className="work-top">
            <main className="workspace" id="main-content" tabIndex={-1}>{children}</main>
            <aside className="operations-rail" aria-label="Laboratory operations">{rightPanel}</aside>
          </div>
          <section className="lower-panels" aria-label="Laboratory status and actions">{bottomPanels}</section>
        </div>
      </div>
      <footer className="status-bar" aria-label="Application status">
        <div><span className={`status-indicator ${api ? "is-online" : apiError ? "is-offline" : "is-checking"}`} />{api ? "LAB READY" : apiError ? "LOCAL API UNAVAILABLE" : "CHECKING LOCAL API"}</div>
        <span className="status-divider" />
        <span>{api ? "PYTHON SERVICE RESPONDING" : apiError ? "START API FROM LOCAL TERMINAL" : "HEALTH CHECK IN PROGRESS"}</span>
        <span className="status-spacer" />
        <span>NO ANALYTICS</span><span className="status-divider" /><span>EDUCATIONAL MODE</span>
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
