import { describe, expect, it } from "vitest";
import { inferSourceType, parseAmount } from "./parser";

describe("parser utilities", () => {
  it("infers source types", () => {
    expect(inferSourceType("Internal Ledger")).toBe("ledger");
    expect(inferSourceType("Stripe settlements")).toBe("psp");
    expect(inferSourceType("Chase Bank Statement")).toBe("bank");
    expect(inferSourceType("NetSuite ERP Export")).toBe("erp");
    expect(inferSourceType("Reserve Holds")).toBe("reserve");
    expect(inferSourceType("Refunds")).toBe("refund");
    expect(inferSourceType("Chargebacks")).toBe("chargeback");
    expect(inferSourceType("Random Sheet")).toBe("unknown");
  });

  it("parses money values", () => {
    expect(parseAmount("$1,250.00")).toBe(1250);
    expect(parseAmount("($500.25)")).toBe(-500.25);
    expect(parseAmount("-$42.10")).toBe(-42.1);
    expect(parseAmount("bad")).toBeNull();
    expect(parseAmount("")).toBeNull();
    expect(parseAmount(null)).toBeNull();
    expect(parseAmount(undefined)).toBeNull();
    expect(parseAmount(0)).toBe(0);
    expect(parseAmount(100.5)).toBe(100.5);
    expect(parseAmount("€2,500.00")).toBe(2500);
    expect(parseAmount("£1,000")).toBe(1000);
  });
});
