import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router"

import { makeStore } from "../../store/store"
import { Signin } from "./Signin"

describe("Signin", () => {
  it("should be defined", async () => {
    const store = makeStore({
      currentUser: { accessToken: "test-token" },
    })
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Signin />
        </MemoryRouter>
      </Provider>,
    )
    expect(screen.getByText(/sign in/i)).toBeDefined()
  })
})
