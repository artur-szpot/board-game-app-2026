import { render, screen } from "@testing-library/react";

import { AdminPanel } from "./AdminPanel";

describe("AdminPanel", () => {
  it("should be defined", async () => {
    render(<AdminPanel />);
    expect(screen.getByText("Admin Panel")).toBeDefined();
  });
});
