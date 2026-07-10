import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";

import { Dashboard } from "./Dashboard";
import { makeStore } from "../../store/store";

describe("Dashboard", () => {
  it("should be defined", () => {
    const store = makeStore({
      currentUser: { accessToken: "test-token" },
    });
    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );
    expect(screen.getByText(/This is the dashboard!/)).toBeDefined();
  });
});
