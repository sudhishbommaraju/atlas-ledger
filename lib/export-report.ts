import { UploadedFile, MatchResult, DisbursableFunds } from './types';

export function downloadReport(
  uploadedFiles: UploadedFile[],
  matchResults: MatchResult[],
  disbursableBreakdown: DisbursableFunds | null,
  parserWarnings: string[]
) {
  const exceptionStatuses = ["unmatched", "duplicate", "timing_drift", "reserve_hold", "eligibility_hold", "invalid"];
  
  const report = {
    generatedAt: new Date().toISOString(),
    disbursableBreakdown,
    files: uploadedFiles.map((file) => ({
      fileName: file.name,
      status: file.status,
      recordCount: file.recordCount,
      warnings: file.warnings,
    })),
    exceptions: matchResults.filter((row) =>
      exceptionStatuses.includes(row.status)
    ),
    matched: matchResults.filter((row) => row.status === "matched"),
    parserWarnings,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `atlas-reconciliation-report-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
