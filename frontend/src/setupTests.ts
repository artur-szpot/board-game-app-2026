import "@testing-library/jest-dom/vitest"
import { vi } from "vitest"

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  writable: true,
  value: vi.fn(),
})
