import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router"

import { makeStore } from "../../store/store"
import { CollectionPanel } from "./CollectionPanel"

describe("CollectionPanel", () => {
  it("should be defined", () => {
    const store = makeStore({
      currentUser: { accessToken: "test-token" },
    })
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CollectionPanel />
        </MemoryRouter>
      </Provider>,
    )
    expect(screen.getByText(/collection panel/i)).toBeDefined()
  })
})
