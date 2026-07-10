import { render, screen } from "@testing-library/react"

import { Todo } from "./Todo"

describe("Todo", () => {
  it("should be defined", () => {
    render(<Todo />)
    expect(screen.getByText("Todo!")).toBeDefined()
  })
})
