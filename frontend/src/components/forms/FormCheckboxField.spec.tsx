import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  PermissionLevel,
  type PermissionShortDto,
  PermissionType,
} from "../../dto/user-data.dto";
import { FormFieldType } from "./common";
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
        permissionType: PermissionType.SYSTEM_COLLECTION,
        permissionLevel: PermissionLevel.READ,
      },
    ];

    render(
      <FormCheckboxField
        kind={FormFieldType.CHECKBOX}
        name="published"
        label="Published"
        checked={false}
        requiredPermissions={{
          [PermissionType.SYSTEM_COLLECTION]: PermissionLevel.FULL,
        }}
        onChange={() => undefined}
      />,
    );

    expect(
      screen.getByText("Published").closest(".form-checkbox"),
    ).toHaveAttribute("hidden");
  });
});
