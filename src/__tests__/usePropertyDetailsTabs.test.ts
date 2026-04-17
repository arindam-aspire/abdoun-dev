import { act, renderHook } from "@testing-library/react";
import { usePropertyDetailsTabs } from "@/features/property-details/hooks/usePropertyDetailsTabs";

describe("usePropertyDetailsTabs", () => {
  it("forces displayTab to overview when location tab hidden", () => {
    const { result } = renderHook(() =>
      usePropertyDetailsTabs({
        canShowLocationTab: false,
        canShowDocumentsTab: true,
      }),
    );

    act(() => {
      result.current.handleTabChange("location");
    });

    expect(result.current.displayTab).toBe("overview");
  });

  it("switches tabs by click without scrolling behavior", () => {
    const { result } = renderHook(() =>
      usePropertyDetailsTabs({
        canShowLocationTab: true,
        canShowDocumentsTab: true,
      }),
    );

    act(() => {
      result.current.handleTabChange("amenities");
    });

    expect(result.current.displayTab).toBe("amenities");
  });

  it("supports documents tab in tab-view mode", () => {
    const { result } = renderHook(() =>
      usePropertyDetailsTabs({
        canShowLocationTab: true,
        canShowDocumentsTab: true,
      }),
    );

    act(() => {
      result.current.handleTabChange("documents");
    });

    expect(result.current.displayTab).toBe("documents");
  });

  it("forces displayTab to overview when documents tab hidden", () => {
    const { result } = renderHook(() =>
      usePropertyDetailsTabs({
        canShowLocationTab: true,
        canShowDocumentsTab: false,
      }),
    );

    act(() => {
      result.current.handleTabChange("documents");
    });

    expect(result.current.displayTab).toBe("overview");
  });
});

