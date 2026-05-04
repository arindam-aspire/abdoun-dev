import {
  buildPropertySearchRequestQuery,
  normalizePropertySearchQueryKey,
} from "@/features/property-search/utils/queryStringBuilder";

describe("queryStringBuilder", () => {
  it("removes sort/view, enforces page, preserves existing params", () => {
    const params = new URLSearchParams({
      status: "buy",
      category: "residential",
      sort: "newest",
      view: "grid",
      city: "Amman",
      page: "5",
    });

    const qs = buildPropertySearchRequestQuery({
      searchParams: params,
      currentPage: 2,
      defaultPageSize: 12,
      sortParamKey: "sort",
      viewParamKey: "view",
    });

    const out = new URLSearchParams(qs);
    expect(out.get("sort")).toBeNull();
    expect(out.get("view")).toBeNull();
    expect(out.get("page")).toBe("2");
    expect(out.get("pageSize")).toBe("12");
    expect(out.get("status")).toBe("buy");
    expect(out.get("category")).toBe("residential");
    expect(out.get("city")).toBe("Amman");
  });

  it("keeps existing pageSize if provided", () => {
    const params = new URLSearchParams({ pageSize: "24" });
    const qs = buildPropertySearchRequestQuery({
      searchParams: params,
      currentPage: 1,
      defaultPageSize: 12,
    });
    const out = new URLSearchParams(qs);
    expect(out.get("pageSize")).toBe("24");
  });

  it("normalizePropertySearchQueryKey sorts params so order does not matter", () => {
    const a = "status=buy&category=residential&page=1&pageSize=12";
    const b = "pageSize=12&status=buy&page=1&category=residential";
    expect(normalizePropertySearchQueryKey(a)).toBe(normalizePropertySearchQueryKey(b));
  });

  it("normalizePropertySearchQueryKey strips a leading question mark", () => {
    expect(normalizePropertySearchQueryKey("?a=1&b=2")).toBe(
      normalizePropertySearchQueryKey("a=1&b=2"),
    );
  });
});

