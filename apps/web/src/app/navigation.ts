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
  readonly group: "PERSONAL PASSWORD TOOLS" | "RESEARCH LAB";
  readonly icon: LucideIcon;
  readonly description: string;
}

export const NAVIGATION: readonly NavigationItem[] = [
  // Primary Personal Password Tools (Local Browser Process)
  {
    id: "generator",
    label: "Password Generator",
    group: "PERSONAL PASSWORD TOOLS",
    icon: Sparkles,
    description: "Generate cryptographically secure passwords and passphrases locally",
  },
  {
    id: "analysis",
    label: "Password Analysis",
    group: "PERSONAL PASSWORD TOOLS",
    icon: ScanSearch,
    description: "Pattern-aware local strength analysis in browser memory",
  },
  {
    id: "policy",
    label: "Policy Checker",
    group: "PERSONAL PASSWORD TOOLS",
    icon: ShieldCheck,
    description: "NIST SP 800-63B-4 and custom service policy compliance",
  },
  {
    id: "reuse",
    label: "Reuse Laboratory",
    group: "PERSONAL PASSWORD TOOLS",
    icon: Repeat2,
    description: "Compare multiple candidate passwords locally for similarity",
  },

  // Separate Research Lab (Loopback API & Synthetic Experiments)
  {
    id: "hashing",
    label: "Hashing Laboratory",
    group: "RESEARCH LAB",
    icon: KeyRound,
    description: "Synthetic-only hash generation and verification demonstrations",
  },
  {
    id: "attack",
    label: "Attack Simulator",
    group: "RESEARCH LAB",
    icon: Crosshair,
    description: "Bounded synthetic guessing experiments against fixed targets",
  },
  {
    id: "benchmarks",
    label: "Benchmarks",
    group: "RESEARCH LAB",
    icon: Gauge,
    description: "Measure local cryptographic latency and throughput",
  },
  {
    id: "reports",
    label: "Results & Reports",
    group: "RESEARCH LAB",
    icon: FileText,
    description: "Current-session secret-free experiment data and exports",
  },
  {
    id: "overview",
    label: "Overview",
    group: "RESEARCH LAB",
    icon: LayoutDashboard,
    description: "Lab status and system resource readings",
  },
  {
    id: "topology",
    label: "Lab Topology",
    group: "RESEARCH LAB",
    icon: Network,
    description: "Trust boundaries and dual-domain architecture diagram",
  },
  {
    id: "learning",
    label: "Learning Center",
    group: "RESEARCH LAB",
    icon: BookOpen,
    description: "Educational security experiments and methodology guides",
  },
];

export const TOP_NAVIGATION: readonly { readonly label: string; readonly page: PageId }[] = [
  { label: "Generate", page: "generator" },
  { label: "Analyze", page: "analysis" },
  { label: "Policy", page: "policy" },
  { label: "Reuse", page: "reuse" },
  { label: "Research Lab", page: "hashing" },
];

export const OPERATION_ICON = Activity;
export const STORAGE_ICON = FlaskConical;
