import { render, screen } from "@testing-library/react";

import { Signin } from "./Signin";

describe("Signin", () => {
  it("should be defined", async () => {
    render(<Signin />);
    expect(screen.getByText("Todo!")).toBeDefined();
  });
});
