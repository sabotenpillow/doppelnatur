import "@testing-library/jest-dom";
import { vi, beforeEach } from "vitest";

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock clipboard
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn(),
  },
});

// Mock window.open
Object.defineProperty(window, "open", {
  value: vi.fn(),
});

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
