import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowDownToLine,
  X,
  ChevronDown,
  ChevronUp,
  Activity,
} from "lucide-react";
import { parseWorkbook } from "../lib/reconciliation/parser";
import type { ParsedSheet, CanonicalTransaction } from "../lib/reconciliation/parser";
import {
  reconcileTransactions,
} from "../lib/reconciliation/engine";
import type {
  ReconciledTransaction,
  ReconciliationResult,
} from "../lib/reconciliation/engine";

/* ── Helpers ───────────────────────────────────────── */

function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

type UploadedFile = {
  fileName: string;
  sheets: ParsedSheet[];
  transactions: CanonicalTransaction[];
  diagnostics: {
    sheetNames: string[];
    sheetsParsed: number;
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
  };
};

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  matched:       { bg: "rgba(115,139,106,0.10)", text: "var(--safe)",    border: "var(--safe-border)" },
  partial:       { bg: "rgba(162,123,66,0.10)",  text: "var(--partial)", border: "var(--partial-border)" },
  unmatched:     { bg: "rgba(139,94,94,0.10)",   text: "var(--blocked)", border: "var(--blocked-border)" },
  duplicate:     { bg: "rgba(139,94,94,0.08)",   text: "#8B5E5E",       border: "rgba(139,94,94,0.18)" },
  timing_drift:  { bg: "rgba(162,123,66,0.08)",  text: "#A27B42",       border: "rgba(162,123,66,0.18)" },
  reserve_hold:  { bg: "rgba(162,123,66,0.08)",  text: "#A27B42",       border: "rgba(162,123,66,0.18)" },
  invalid:       { bg: "rgba(139,94,94,0.06)",   text: "#8B5E5E",       border: "rgba(139,94,94,0.12)" },
};

const sourceTypeLabels: Record<string, string> = {
  ledger: "Ledger",
  psp: "PSP",
  bank: "Bank",
  erp: "ERP",
  reserve: "Reserve",
  refund: "Refund",
  chargeback: "Chargeback",
  unknown: "Unknown",
};

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] },
});

/* ── Component ─────────────────────────────────────── */

export default function ReconciliationDashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [transactions, setTransactions] = useState<ReconciledTransaction[]>([]);
  const [summary, setSummary] = useState<ReconciliationResult["summary"] | null>(null);
  const [disbursableBreakdown, setDisbursableBreakdown] = useState<ReconciliationResult["disbursableBreakdown"] | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setIsProcessing(true);
    const fileArray = Array.from(files);
    const allParsedFiles: UploadedFile[] = [...uploadedFiles];

    for (const file of fileArray) {
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (extension === "xlsx" || extension === "xls") {
        const buffer = await file.arrayBuffer();
        const parsed = parseWorkbook(buffer, file.name);

        allParsedFiles.push({
          fileName: file.name,
          sheets: parsed.sheets,
          transactions: parsed.transactions,
          diagnostics: parsed.diagnostics,
        });

        console.log("Workbook parsed:", parsed.diagnostics);
      }
    }

    const allTransactions = allParsedFiles.flatMap((f) => f.transactions);
    const reconciliation = reconcileTransactions(allTransactions);

    setUploadedFiles(allParsedFiles);
    setTransactions(reconciliation.records);
    setSummary(reconciliation.summary);
    setDisbursableBreakdown(reconciliation.disbursableBreakdown);
    setIsProcessing(false);
  }, [uploadedFiles]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleReset = () => {
    setUploadedFiles([]);
    setTransactions([]);
    setSummary(null);
    setDisbursableBreakdown(null);
    setShowAllRows(false);
  };

  const filesUploaded = uploadedFiles.length;
  const sheetsParsed = uploadedFiles.reduce((sum, f) => sum + f.sheets.length, 0);
  const recordsParsed = transactions.length;
  const displayedRows = showAllRows ? transactions : transactions.slice(0, 50);

  return (
    <div className="min-h-screen" style={{ background: "var(--ink)", color: "var(--text-primary)" }}>
      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-50 glass"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
          <a href="#/" className="flex items-center gap-2.5 no-underline">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "var(--text-primary)" }}
            >
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path d="M7 2L12.5 11.5H1.5L7 2Z" fill="none" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Atlas Ledger
            </span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href="#/"
              className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Home
            </a>
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-md"
              style={{
                color: "var(--accent)",
                background: "var(--accent-dim)",
                border: "1px solid var(--accent-border)",
              }}
            >
              Reconciliation
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* ── Header ── */}
        <motion.div {...fade(0)}>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            Reconciliation Engine
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)", maxWidth: 600 }}>
            Upload your settlement workbook to reconcile across all sources. Every sheet is parsed, normalized, and cross-matched automatically.
          </p>
        </motion.div>

        {/* ── Upload Zone ── */}
        <motion.div {...fade(0.05)}>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300"
            style={{
              borderColor: isDragOver ? "var(--accent)" : "var(--border-2)",
              background: isDragOver ? "var(--accent-dim)" : "var(--surface)",
              padding: uploadedFiles.length > 0 ? "24px" : "48px 24px",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }
              }}
            />

            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <Activity size={28} className="animate-spin" style={{ color: "var(--accent)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Processing workbook…
                </span>
              </div>
            ) : uploadedFiles.length === 0 ? (
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}
                >
                  <ArrowDownToLine size={22} style={{ color: "var(--accent)" }} />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium mb-1">
                    Drop settlement workbook here
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    Accepts .xlsx and .xls files · All sheets parsed automatically
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={20} style={{ color: "var(--accent)" }} />
                  <div>
                    <div className="text-sm font-medium">
                      {uploadedFiles.map((f) => f.fileName).join(", ")}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      {sheetsParsed} sheets · {recordsParsed} records parsed · Click or drop to add more files
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  className="p-1.5 rounded-md transition-colors hover:bg-black/5"
                  style={{ color: "var(--text-tertiary)" }}
                  title="Clear all"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Results ── */}
        <AnimatePresence>
          {summary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* ── Metrics ── */}
              <motion.div {...fade(0.1)} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "FILES UPLOADED", value: String(filesUploaded) },
                  { label: "SHEETS PARSED", value: String(sheetsParsed) },
                  { label: "RECORDS PARSED", value: String(recordsParsed) },
                  { label: "MATCH RATE", value: `${summary.matchRate}%`, accent: summary.matchRate > 0 },
                  { label: "EXCEPTIONS", value: String(summary.exceptions), warn: summary.exceptions > 0 },
                  { label: "DISBURSABLE", value: formatCurrency(summary.disbursable), accent: summary.disbursable > 0 },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl p-4"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      boxShadow: "var(--shadow-soft)",
                    }}
                  >
                    <div
                      className="text-[10px] font-semibold tracking-wider mb-2"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {m.label}
                    </div>
                    <div
                      className="text-lg font-semibold tabular"
                      style={{
                        color: m.accent
                          ? "var(--safe)"
                          : m.warn
                          ? "var(--blocked)"
                          : "var(--text-primary)",
                      }}
                    >
                      {m.value}
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* ── Sources + Breakdown ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ingested Sources */}
                <motion.div {...fade(0.15)}>
                  <div
                    className="rounded-xl p-5"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      boxShadow: "var(--shadow-soft)",
                    }}
                  >
                    <h3
                      className="text-xs font-semibold tracking-wider mb-4"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      INGESTED SOURCES
                    </h3>
                    <div className="space-y-2">
                      {uploadedFiles.flatMap((file) =>
                        file.sheets.map((sheet) => (
                          <div
                            key={`${file.fileName}-${sheet.sheetName}`}
                            className="rounded-lg p-3 flex items-center justify-between"
                            style={{
                              background: "var(--ink)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold"
                                style={{
                                  background: "var(--accent-dim)",
                                  color: "var(--accent)",
                                  border: "1px solid var(--accent-border)",
                                }}
                              >
                                {sourceTypeLabels[sheet.sourceType]?.slice(0, 2).toUpperCase() || "??"}
                              </div>
                              <div>
                                <div className="text-sm font-medium">{sheet.sheetName}</div>
                                <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                                  {file.fileName} · {sheet.recordCount} records
                                </div>
                              </div>
                            </div>
                            <span
                              className="text-[10px] font-semibold tracking-wider px-2 py-1 rounded"
                              style={{
                                color: "var(--text-secondary)",
                                background: "var(--ink-3)",
                              }}
                            >
                              {sourceTypeLabels[sheet.sourceType] || sheet.sourceType}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {uploadedFiles.map((f) => (
                        <div key={f.fileName}>
                          Workbook parsed: {f.sheets.length} sheets,{" "}
                          {f.sheets.reduce((sum, s) => sum + s.recordCount, 0)} records.
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Disbursable Breakdown */}
                {disbursableBreakdown && (
                  <motion.div {...fade(0.2)}>
                    <div
                      className="rounded-xl p-5"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-soft)",
                      }}
                    >
                      <h3
                        className="text-xs font-semibold tracking-wider mb-4"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        DISBURSABLE BREAKDOWN
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: "Gross Settled Funds", value: disbursableBreakdown.grossSettledFunds, positive: true },
                          { label: "Fees", value: -disbursableBreakdown.fees },
                          { label: "Refunds", value: -disbursableBreakdown.refunds },
                          { label: "Chargebacks", value: -disbursableBreakdown.chargebacks },
                          { label: "Reserves", value: -disbursableBreakdown.reserves },
                          { label: "Unresolved Exposure", value: -disbursableBreakdown.unresolvedExposure },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between text-sm">
                            <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                            <span
                              className="font-mono font-medium tabular"
                              style={{
                                color: item.positive
                                  ? "var(--safe)"
                                  : item.value < 0
                                  ? "var(--blocked)"
                                  : "var(--text-secondary)",
                              }}
                            >
                              {formatCurrency(item.value)}
                            </span>
                          </div>
                        ))}
                        <div
                          className="pt-3 flex items-center justify-between text-sm font-semibold"
                          style={{ borderTop: "1px solid var(--border)" }}
                        >
                          <span>Available Disbursable</span>
                          <span className="font-mono tabular" style={{ color: "var(--safe)" }}>
                            {formatCurrency(disbursableBreakdown.availableDisbursable)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ── Reconciled Records Table ── */}
              <motion.div {...fade(0.25)}>
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-soft)",
                  }}
                >
                  <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                    <h3 className="text-xs font-semibold tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                      RECONCILED RECORDS
                      <span className="ml-2 text-[11px] font-normal" style={{ color: "var(--text-dim)" }}>
                        ({transactions.length})
                      </span>
                    </h3>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} style={{ color: "var(--safe)" }} />
                        {summary.matched} matched
                      </span>
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle size={12} style={{ color: "var(--partial)" }} />
                        {summary.partial} partial
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Upload size={12} style={{ color: "var(--blocked)" }} />
                        {summary.unmatched} unmatched
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                          {["Source", "Reference", "Description", "Amount", "Status", "Confidence", "Issue"].map(
                            (h) => (
                              <th
                                key={h}
                                className="text-left pb-3 pt-4 px-5 text-[10px] font-semibold tracking-wider"
                                style={{ color: "var(--text-tertiary)" }}
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {displayedRows.map((row, i) => {
                          const style = statusStyles[row.matchStatus] || statusStyles.unmatched;
                          return (
                            <tr
                              key={`${row.sourceName}-${row.id}-${i}`}
                              className="transition-colors"
                              style={{ borderBottom: "1px solid var(--border)" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ink)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <td className="py-3 px-5 font-medium" style={{ color: "var(--text-primary)" }}>
                                {row.sourceName}
                              </td>
                              <td className="py-3 px-5 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                                {row.reference || row.transactionId || row.id}
                              </td>
                              <td className="py-3 px-5 text-xs max-w-[200px] truncate" style={{ color: "var(--text-tertiary)" }}>
                                {row.description || "—"}
                              </td>
                              <td className="py-3 px-5 font-mono tabular" style={{ color: "var(--text-primary)" }}>
                                {formatCurrency(row.amount, row.currency)}
                              </td>
                              <td className="py-3 px-5">
                                <span
                                  className="inline-block text-[10px] font-semibold tracking-wider px-2 py-1 rounded"
                                  style={{
                                    background: style.bg,
                                    color: style.text,
                                    border: `1px solid ${style.border}`,
                                  }}
                                >
                                  {row.matchStatus.replace("_", " ").toUpperCase()}
                                </span>
                              </td>
                              <td className="py-3 px-5 font-mono text-xs tabular" style={{ color: "var(--text-secondary)" }}>
                                {row.confidence}%
                              </td>
                              <td className="py-3 px-5 text-xs max-w-[250px] truncate" style={{ color: "var(--text-tertiary)" }}>
                                {row.issue || "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {transactions.length > 50 && (
                    <div
                      className="p-3 flex justify-center"
                      style={{ borderTop: "1px solid var(--border)" }}
                    >
                      <button
                        onClick={() => setShowAllRows(!showAllRows)}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                        style={{ color: "var(--accent)" }}
                      >
                        {showAllRows ? (
                          <>
                            <ChevronUp size={14} /> Show fewer rows
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} /> Show all {transactions.length} rows
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
