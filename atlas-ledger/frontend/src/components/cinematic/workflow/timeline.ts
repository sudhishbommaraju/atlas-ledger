/** Continuous workflow timeline — 36s loop, t ∈ [0, 1) */

export const LOOP_MS = 36000;

export type DropzoneState = "hidden" | "idle" | "hover" | "processing" | "reconciled";

export interface CursorState {
  x: number; // % of stage
  y: number;
  visible: boolean;
  pressing: boolean;
  dragging: boolean;
}

export interface WorkflowSnapshot {
  t: number;
  cursor: CursorState;
  dropzone: DropzoneState;
  filesVisible: boolean;
  draggedFileOffset: { x: number; y: number } | null;
  logLines: { time: string; text: string; type: "ok" | "warn" | "neutral" }[];
  reconcilePct: number;
  reportPhase: "idle" | "processing" | "compiled" | "ready";
  reportsVisible: number;
  fixesApplied: boolean;
  payoutable: string;
  blocked: string;
  exceptions: number;
  approvalStep: number;
  executionProgress: number;
  ledgerRows: { id: string; status: string; amount: string; state: "safe" | "partial" | "blocked" }[];
  camera: { scale: number; x: number; y: number };
  activeSidebar: string;
  url: string;
  phaseLabel: string;
}

function lerp(a: number, b: number, u: number) {
  return a + (b - a) * u;
}

function segmentT(t: number, start: number, end: number) {
  if (t < start) return 0;
  if (t > end) return 1;
  return (t - start) / (end - start);
}

function easeOut(u: number) {
  return 1 - Math.pow(1 - u, 3);
}

function easeInOut(u: number) {
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

type WP = { t: number; x: number; y: number; press?: boolean; drag?: boolean };

const CURSOR_PATH: WP[] = [
  { t: 0, x: 92, y: 88 },
  { t: 0.07, x: 88, y: 82 },
  { t: 0.11, x: 14, y: 62 },
  { t: 0.13, x: 14, y: 62, press: true },
  { t: 0.14, x: 14, y: 62, press: true, drag: true },
  { t: 0.21, x: 48, y: 44, drag: true },
  { t: 0.23, x: 48, y: 44 },
  { t: 0.26, x: 62, y: 48 },
  { t: 0.38, x: 68, y: 42 },
  { t: 0.48, x: 70, y: 40 },
  { t: 0.52, x: 74, y: 36 },
  { t: 0.54, x: 74, y: 36, press: true },
  { t: 0.58, x: 76, y: 48 },
  { t: 0.64, x: 78, y: 50, press: true },
  { t: 0.68, x: 58, y: 58 },
  { t: 0.72, x: 56, y: 62, press: true },
  { t: 0.76, x: 62, y: 66 },
  { t: 0.78, x: 64, y: 68, press: true },
  { t: 0.82, x: 52, y: 56 },
  { t: 0.95, x: 50, y: 54 },
  { t: 1, x: 52, y: 52 },
];

function interpolateCursor(t: number): CursorState {
  let i = 0;
  while (i < CURSOR_PATH.length - 1 && CURSOR_PATH[i + 1].t <= t) i++;
  const a = CURSOR_PATH[i];
  const b = CURSOR_PATH[Math.min(i + 1, CURSOR_PATH.length - 1)];
  const u = b.t === a.t ? 0 : easeInOut(segmentT(t, a.t, b.t));

  return {
    x: lerp(a.x, b.x, u),
    y: lerp(a.y, b.y, u),
    visible: t >= 0.07 && t < 0.98,
    pressing: Boolean((a.press || b.press) && u > 0.3 && u < 0.95),
    dragging: Boolean((a.drag || b.drag) && u > 0.05 && u < 0.98),
  };
}

const ALL_LOGS: WorkflowSnapshot["logLines"] = [
  { time: "09:14:01", text: "Stripe settlement matched", type: "ok" },
  { time: "09:14:02", text: "Adyen payout batch verified", type: "ok" },
  { time: "09:14:02", text: "Refund offsets applied", type: "ok" },
  { time: "09:14:03", text: "Chase bank credit missing", type: "warn" },
  { time: "09:14:04", text: "Reserve hold recalculated", type: "neutral" },
  { time: "09:14:05", text: "Lineage path verified — 14 hops", type: "ok" },
];

export function getWorkflowSnapshot(t: number): WorkflowSnapshot {
  const cursor = interpolateCursor(t);

  let dropzone: DropzoneState = "hidden";
  if (t >= 0.1 && t < 0.14) dropzone = "idle";
  else if (t >= 0.14 && t < 0.22) dropzone = cursor.dragging ? "hover" : "idle";
  else if (t >= 0.22 && t < 0.32) dropzone = "processing";
  else if (t >= 0.32) dropzone = "reconciled";

  const logCount = Math.min(
    ALL_LOGS.length,
    Math.floor(easeOut(segmentT(t, 0.28, 0.48)) * ALL_LOGS.length)
  );

  let reportPhase: WorkflowSnapshot["reportPhase"] = "idle";
  if (t >= 0.54 && t < 0.58) reportPhase = "processing";
  else if (t >= 0.58 && t < 0.62) reportPhase = "compiled";
  else if (t >= 0.62) reportPhase = "ready";

  const reportsVisible = Math.min(5, Math.floor(easeOut(segmentT(t, 0.56, 0.66)) * 5));

  const fixesApplied = t >= 0.66;
  const fixU = easeOut(segmentT(t, 0.64, 0.74));

  const payoutable = fixU > 0.5 ? "$1.42M" : t >= 0.32 ? "$1.10M" : "$1.10M";
  const blocked = fixesApplied
    ? "$180K"
    : t >= 0.28
      ? "$480K"
      : "$100K";

  const exceptions = fixesApplied ? Math.max(0, Math.round(lerp(3, 0, fixU))) : t >= 0.28 ? 3 : 0;

  const approvalStep = Math.floor(easeOut(segmentT(t, 0.7, 0.78)) * 3);

  const executionProgress = easeOut(segmentT(t, 0.78, 0.9)) * 100;

  const ledgerStart = 0.82;
  const ledgerCount = Math.min(5, Math.floor(easeOut(segmentT(t, ledgerStart, 0.96)) * 5));

  const ledgerRows: WorkflowSnapshot["ledgerRows"] = (
    [
      { id: "PAY-8842", status: "Executed", amount: "$840K", state: "safe" as const },
      { id: "PAY-8843", status: "Settled", amount: "$420K", state: "safe" as const },
      { id: "PAY-8844", status: "Pending retry", amount: "$48K", state: "partial" as const },
      { id: "REC-1201", status: "Drift resolved", amount: "$8K", state: "safe" as const },
      { id: "BLK-0091", status: "Funds held", amount: "$180K", state: "blocked" as const },
    ] as WorkflowSnapshot["ledgerRows"]
  ).slice(0, ledgerCount || (t >= 0.9 ? 5 : 0));

  const camDrift = Math.sin(t * Math.PI * 2) * 0.4;
  const camFocus =
    t < 0.25 ? { x: -2, y: 1, scale: 1.02 }
    : t < 0.55 ? { x: 0, y: 0, scale: 1 }
    : t < 0.78 ? { x: 1.5, y: -0.5, scale: 1.01 }
    : { x: 0.5, y: 0.5, scale: 1.015 };

  let phaseLabel = "Ingestion";
  if (t >= 0.07 && t < 0.24) phaseLabel = "File drop";
  else if (t >= 0.24 && t < 0.5) phaseLabel = "Reconciliation";
  else if (t >= 0.5 && t < 0.64) phaseLabel = "Reporting";
  else if (t >= 0.64 && t < 0.7) phaseLabel = "Auto-fix";
  else if (t >= 0.7 && t < 0.78) phaseLabel = "Approval";
  else if (t >= 0.78 && t < 0.82) phaseLabel = "Execution";
  else if (t >= 0.82) phaseLabel = "Live ledger";

  let url = "app.atlasledger.com / readiness";
  let activeSidebar = "readiness";
  if (t >= 0.5) { url = "app.atlasledger.com / reports"; activeSidebar = "readiness"; }
  if (t >= 0.7) { url = "app.atlasledger.com / approvals"; activeSidebar = "readiness"; }
  if (t >= 0.78) { url = "app.atlasledger.com / execution"; activeSidebar = "readiness"; }
  if (t >= 0.82) { url = "app.atlasledger.com / ledger"; activeSidebar = "ledger"; }

  return {
    t,
    cursor,
    dropzone,
    filesVisible: t < 0.24,
    draggedFileOffset: cursor.dragging ? { x: cursor.x, y: cursor.y } : null,
    logLines: ALL_LOGS.slice(0, logCount),
    reconcilePct: Math.round(lerp(12, fixesApplied ? 98 : 87, easeOut(segmentT(t, 0.26, 0.7)))),
    reportPhase,
    reportsVisible,
    fixesApplied,
    payoutable,
    blocked,
    exceptions,
    approvalStep,
    executionProgress,
    ledgerRows,
    camera: {
      scale: camFocus.scale + camDrift * 0.002,
      x: camFocus.x + camDrift,
      y: camFocus.y + camDrift * 0.5,
    },
    activeSidebar,
    url,
    phaseLabel,
  };
}
