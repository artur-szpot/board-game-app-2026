import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router"

import { makeStore } from "../../store/store"
import { AdminPanel } from "./AdminPanel"

describe("AdminPanel", () => {
  it("should be defined", () => {
    const store = makeStore({
      currentUser: { accessToken: "test-token" },
    })
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminPanel />
        </MemoryRouter>
      </Provider>,
    )
    expect(screen.getByText(/admin panel/i)).toBeDefined()
  })
})
