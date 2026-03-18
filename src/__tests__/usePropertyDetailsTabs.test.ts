import { act, renderHook } from "@testing-library/react";
import { usePropertyDetailsTabs } from "@/features/property-details/hooks/usePropertyDetailsTabs";

// Minimal IntersectionObserver mock for jsdom
class IntersectionObserverMock {
  public observe = jest.fn();
  public unobserve = jest.fn();
  public disconnect = jest.fn();
  constructor() {}
}

describe("usePropertyDetailsTabs", () => {
  beforeEach(() => {
    (globalThis as any).IntersectionObserver = IntersectionObserverMock as any;
    // jsdom doesn't implement this; hook expects it.
    (HTMLElement.prototype as any).scrollIntoView = jest.fn();
  });

  it("forces displayTab to overview when location tab hidden", () => {
    const { result } = renderHook(() =>
      usePropertyDetailsTabs({ isExclusive: false, hasVirtualTour: true }),
    );

    act(() => {
      result.current.locationRef.current = document.createElement("section");
      result.current.handleTabChange("location");
    });

    expect(result.current.displayTab).toBe("overview");
  });

  it("forces displayTab to overview when virtual tour tab hidden", () => {
    const { result } = renderHook(() =>
      usePropertyDetailsTabs({ isExclusive: true, hasVirtualTour: false }),
    );

    act(() => {
      result.current.virtualTourRef.current = document.createElement("section");
      result.current.handleTabChange("virtualTour");
    });

    expect(result.current.displayTab).toBe("overview");
  });

  it("scrolls to target section on tab change", () => {
    const { result } = renderHook(() =>
      usePropertyDetailsTabs({ isExclusive: true, hasVirtualTour: true }),
    );

    const el = document.createElement("section");
    (el as any).scrollIntoView = jest.fn();

    act(() => {
      result.current.amenitiesRef.current = el;
      result.current.handleTabChange("amenities");
    });

    expect((el as any).scrollIntoView).toHaveBeenCalled();
  });
});

