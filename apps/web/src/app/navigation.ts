import {
  Activity,
  BookOpen,
  Crosshair,
  FileText,
  FlaskConical,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Network,
  Repeat2,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { PageId } from "./types.js";

export interface NavigationItem {
  readonly id: PageId;
  readonly label: string;
  readonly group: "LAB WORKSPACE" | "ANALYSIS & EDUCATION";
  readonly icon: LucideIcon;
  readonly description: string;
}

export const NAVIGATION: readonly NavigationItem[] = [
  { id: "overview", label: "Overview", group: "LAB WORKSPACE", icon: LayoutDashboard, description: "Lab status and recent activity" },
  { id: "topology", label: "Lab Topology", group: "LAB WORKSPACE", icon: Network, description: "Local components and trust boundaries" },
  { id: "analysis", label: "Password Analysis", group: "ANALYSIS & EDUCATION", icon: ScanSearch, description: "Pattern-aware local estimate" },
  { id: "policy", label: "Policy Checker", group: "ANALYSIS & EDUCATION", icon: ShieldCheck, description: "Independent policy checks and comparison" },
  { id: "reuse", label: "Reuse Laboratory", group: "ANALYSIS & EDUCATION", icon: Repeat2, description: "Compare synthetic examples in memory" },
  { id: "generator", label: "Password Generator", group: "ANALYSIS & EDUCATION", icon: Sparkles, description: "Generate secure random values locally" },
  { id: "hashing", label: "Hashing Laboratory", group: "LAB WORKSPACE", icon: KeyRound, description: "Hash and verify a synthetic sample" },
  { id: "attack", label: "Attack Simulator", group: "LAB WORKSPACE", icon: Crosshair, description: "Bounded synthetic guessing experiments" },
  { id: "benchmarks", label: "Benchmarks", group: "LAB WORKSPACE", icon: Gauge, description: "Measure actual local operations" },
  { id: "reports", label: "Results & Reports", group: "LAB WORKSPACE", icon: FileText, description: "Current-session secret-free results" },
  { id: "learning", label: "Learning Center", group: "ANALYSIS & EDUCATION", icon: BookOpen, description: "Guided security experiments" },
];

export const TOP_NAVIGATION: readonly { readonly label: string; readonly page: PageId }[] = [
  { label: "Lab", page: "overview" },
  { label: "Experiments", page: "attack" },
  { label: "Analysis", page: "analysis" },
  { label: "Reports", page: "reports" },
  { label: "Learn", page: "learning" },
];

export const OPERATION_ICON = Activity;
export const STORAGE_ICON = FlaskConical;
