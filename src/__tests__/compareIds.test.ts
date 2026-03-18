import { parseCompareIds } from "@/features/compare/utils/compareIds";

describe("parseCompareIds", () => {
  it("returns [] for null/empty", () => {
    expect(parseCompareIds(null)).toEqual([]);
    expect(parseCompareIds("")).toEqual([]);
  });

  it("parses comma-separated ints and ignores non-numbers", () => {
    expect(parseCompareIds("1, 2, x, 3")).toEqual([1, 2, 3]);
  });
});

