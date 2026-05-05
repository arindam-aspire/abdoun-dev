import {
  createPaginatedResultFromListWire,
  paginationInputFromListPayload,
} from "@/lib/api/pagination";

describe("paginationInputFromListPayload", () => {
  it("prefers nested pagination over flat fields", () => {
    const input = paginationInputFromListPayload({
      items: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 100,
        totalPages: 10,
        hasNext: true,
        hasPrevious: false,
      },
      total: 999,
      totalPages: 1,
    });
    expect(input?.total).toBe(100);
    expect(input?.totalPages).toBe(10);
  });

  it("reads flat fields when pagination is absent", () => {
    const input = paginationInputFromListPayload({
      items: [{}],
      page: 2,
      pageSize: 10,
      total: 42,
      totalPages: 5,
      hasNext: true,
      hasPrevious: true,
    });
    expect(input?.total).toBe(42);
    expect(input?.totalPages).toBe(5);
    expect(input?.page).toBe(2);
    expect(input?.pageSize).toBe(10);
    expect(input?.hasNext).toBe(true);
    expect(input?.hasPrevious).toBe(true);
  });

  it("returns undefined when neither nested nor flat hints exist", () => {
    expect(paginationInputFromListPayload({ items: [] })).toBeUndefined();
  });
});

describe("createPaginatedResultFromListWire", () => {
  it("normalizes flat list responses", () => {
    const result = createPaginatedResultFromListWire<{ id: number }>(
      {
        items: [{ id: 1 }],
        page: 1,
        pageSize: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrevious: false,
      },
      { page: 1, pageSize: 10 },
    );
    expect(result.items).toHaveLength(1);
    expect(result.pagination.total).toBe(25);
    expect(result.pagination.totalPages).toBe(3);
  });
});
