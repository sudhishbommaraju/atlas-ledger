import { UploadedFile, CanonicalResults } from './types';

export function downloadReport(
  uploadedFiles: UploadedFile[],
  results: CanonicalResults
) {
  const report = {
    runId: results.runId,
    generatedAt: results.generatedAt,
    disbursableBreakdown: results.disbursableBreakdown,
    sourceHealth: uploadedFiles.map((file) => ({
      fileName: file.name,
      status: file.status,
      recordCount: file.recordCount,
      warnings: file.warnings,
    })),
    matchRate: results.matchRate,
    metrics: results.metrics,
    parserWarnings: results.parserWarnings,
    excludedSheets: results.excludedSheets,
    reconciliationGraph: results.clusters,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `atlas-reconciliation-report-${results.runId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
