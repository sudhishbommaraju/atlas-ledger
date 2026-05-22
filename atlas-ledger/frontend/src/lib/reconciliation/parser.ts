import * as XLSX from "xlsx";

export type SourceType =
  | "ledger"
  | "psp"
  | "bank"
  | "erp"
  | "reserve"
  | "refund"
  | "chargeback"
  | "unknown";

export type ParsedSheet = {
  sheetName: string;
  sourceType: SourceType;
  rows: Record<string, unknown>[];
  recordCount: number;
  warnings: string[];
};

export type CanonicalTransaction = {
  id: string;
  sourceFile: string;
  sourceName: string;
  sourceType: SourceType;
  transactionId?: string;
  reference?: string;
  amount: number;
  currency: string;
  date?: string;
  description?: string;
  counterparty?: string;
  status?: string;
  fee?: number;
  reserve?: number;
  valid: boolean;
  issue?: string;
  raw: Record<string, unknown>;
};

export function inferSourceType(name: string): SourceType {
  const value = name.toLowerCase();

  if (value.includes("ledger") || value.includes("internal")) return "ledger";
  if (
    value.includes("stripe") ||
    value.includes("adyen") ||
    value.includes("braintree") ||
    value.includes("psp")
  )
    return "psp";
  if (
    value.includes("bank") ||
    value.includes("chase") ||
    value.includes("statement")
  )
    return "bank";
  if (
    value.includes("erp") ||
    value.includes("netsuite") ||
    value.includes("gl")
  )
    return "erp";
  if (value.includes("reserve")) return "reserve";
  if (value.includes("refund")) return "refund";
  if (value.includes("chargeback") || value.includes("dispute"))
    return "chargeback";

  return "unknown";
}

export function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[\s_\-]/g, "");
}

function getValue(
  row: Record<string, unknown>,
  candidates: string[]
): unknown {
  const normalizedCandidates = candidates.map(normalizeHeader);

  for (const [key, value] of Object.entries(row)) {
    if (normalizedCandidates.includes(normalizeHeader(key))) {
      return value;
    }
  }

  return undefined;
}

export function parseAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  let text = String(value).trim();

  if (!text) return null;

  let negative = false;

  if (text.startsWith("(") && text.endsWith(")")) {
    negative = true;
    text = text.slice(1, -1);
  }

  text = text.replace(/[$€£,\s]/g, "");

  if (text.startsWith("-")) {
    negative = true;
    text = text.slice(1);
  }

  const parsed = Number(text);

  if (!Number.isFinite(parsed)) return null;

  return negative ? -Math.abs(parsed) : parsed;
}

function stableId(parts: Array<string | number | undefined>): string {
  return parts
    .map((part) => String(part ?? "").trim().toLowerCase())
    .join("|")
    .replace(/[^a-z0-9|.-]/g, "")
    .slice(0, 160);
}

export function parseWorkbook(
  buffer: ArrayBuffer,
  sourceFile: string
): {
  sheets: ParsedSheet[];
  transactions: CanonicalTransaction[];
  diagnostics: {
    sheetNames: string[];
    sheetsParsed: number;
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
  };
} {
  const workbook = XLSX.read(buffer, { type: "array" });

  const sheets: ParsedSheet[] = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
      raw: false,
    });

    const nonEmptyRows = rows.filter((row) =>
      Object.values(row).some((value) => String(value).trim() !== "")
    );
    
    let resolvedSourceName = sheetName;
    if (workbook.SheetNames.length === 1 && sheetName.toLowerCase().startsWith('sheet')) {
       // It's likely a CSV or single-sheet file with a generic name. Use filename.
       resolvedSourceName = sourceFile.split('.').slice(0, -1).join('.') || sourceFile;
    }

    return {
      sheetName: resolvedSourceName,
      sourceType: inferSourceType(resolvedSourceName),
      rows: nonEmptyRows,
      recordCount: nonEmptyRows.length,
      warnings: [],
    };
  }).filter((sheet) => sheet.recordCount > 0);

  const transactions = sheets.flatMap((sheet) =>
    sheet.rows.map((row, index) =>
      normalizeRow(row, {
        sourceFile,
        sourceName: sheet.sheetName,
        sourceType: sheet.sourceType,
        rowIndex: index,
      })
    )
  );

  console.log("Sheet names:", workbook.SheetNames);
  console.log(
    "Parsed sheets:",
    sheets.map((s) => [s.sheetName, s.recordCount])
  );
  console.log("Total normalized records:", transactions.length);

  return {
    sheets,
    transactions,
    diagnostics: {
      sheetNames: workbook.SheetNames,
      sheetsParsed: sheets.length,
      totalRecords: transactions.length,
      validRecords: transactions.filter((t) => t.valid).length,
      invalidRecords: transactions.filter((t) => !t.valid).length,
    },
  };
}

export function normalizeRow(
  row: Record<string, unknown>,
  meta: {
    sourceFile: string;
    sourceName: string;
    sourceType: SourceType;
    rowIndex: number;
  }
): CanonicalTransaction {
  const transactionIdRaw = getValue(row, [
    "transaction_id",
    "transactionId",
    "txn_id",
    "txn",
    "id",
    "payment_id",
    "settlement_id",
    "external_id",
  ]);

  const referenceRaw = getValue(row, [
    "reference",
    "ref",
    "external_reference",
    "externalReference",
    "bank_reference",
    "processor_reference",
  ]);

  const amountRaw = getValue(row, [
    "amount",
    "gross_amount",
    "net_amount",
    "settlement_amount",
    "debit",
    "credit",
    "value",
    "payout_amount",
  ]);

  const currencyRaw = getValue(row, ["currency", "ccy", "curr"]);
  const dateRaw = getValue(row, [
    "date",
    "settlement_date",
    "created_at",
    "posted_at",
    "effective_date",
    "transaction_date",
  ]);
  const descriptionRaw = getValue(row, [
    "description",
    "memo",
    "details",
    "narrative",
    "counterparty",
    "merchant",
    "payee",
  ]);
  const statusRaw = getValue(row, [
    "status",
    "state",
    "settlement_status",
    "eligibility_status",
  ]);
  const feeRaw = getValue(row, [
    "fee",
    "fees",
    "processing_fee",
    "stripe_fee",
    "psp_fee",
  ]);
  const reserveRaw = getValue(row, [
    "reserve",
    "reserve_hold",
    "hold_amount",
    "risk_hold",
  ]);

  const amount = parseAmount(amountRaw);
  const fee = parseAmount(feeRaw);
  const reserve = parseAmount(reserveRaw);

  const transactionId = transactionIdRaw
    ? String(transactionIdRaw).trim()
    : undefined;
  const reference = referenceRaw
    ? String(referenceRaw).trim()
    : transactionId;
  const date = dateRaw ? String(dateRaw).trim() : undefined;

  const fallbackId = stableId([
    meta.sourceName,
    meta.rowIndex,
    reference,
    amount ?? "",
    date ?? "",
  ]);

  const valid = amount !== null;

  return {
    id: transactionId || reference || fallbackId,
    sourceFile: meta.sourceFile,
    sourceName: meta.sourceName,
    sourceType: meta.sourceType,
    transactionId,
    reference,
    amount: amount ?? 0,
    currency: currencyRaw ? String(currencyRaw).trim().toUpperCase() : "USD",
    date,
    description: descriptionRaw ? String(descriptionRaw).trim() : undefined,
    status: statusRaw ? String(statusRaw).trim() : undefined,
    fee: fee ?? undefined,
    reserve: reserve ?? undefined,
    valid,
    issue: valid ? undefined : "Missing or invalid amount",
    raw: row,
  };
}
