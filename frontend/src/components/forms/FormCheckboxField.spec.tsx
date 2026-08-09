import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PermissionShortDto } from "../../dto/user-data.dto";
import { FormCheckboxField } from "./FormCheckboxField";

const mockState = {
  currentUser: {
    accessToken: "test-token",
    permissions: [] as PermissionShortDto[],
  },
};

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => undefined,
  useAppSelector: (selector: (state: typeof mockState) => unknown) =>
    selector(mockState),
}));

describe("FormCheckboxField", () => {
  beforeEach(() => {
    mockState.currentUser.permissions = [];
  });

  it("hides the checkbox when the current user lacks the required permission", () => {
    mockState.currentUser.permissions = [
      {
        permissionType: "SYSTEM_COLLECTION",
        permissionLevel: "READ",
      },
    ];

    render(
      <FormCheckboxField
        name="published"
        label="Published"
        checked={false}
        requiredPermissions={{ SYSTEM_COLLECTION: "FULL" }}
        onChange={() => undefined}
      />,
    );

    expect(
      screen.getByText("Published").closest(".form-checkbox"),
    ).toHaveAttribute("hidden");
  });
});
