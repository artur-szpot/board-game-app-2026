import { render, screen } from "@testing-library/react"

import { Todo } from "./Todo"

describe("Todo", () => {
  it("should be defined", async () => {
    render(<Todo />)
    expect(screen.getByText("Todo!")).toBeDefined()
  })
})
