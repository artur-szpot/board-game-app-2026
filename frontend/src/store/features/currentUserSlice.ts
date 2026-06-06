import type { PayloadAction } from "@reduxjs/toolkit"

import { type LoginDto } from "../../dto/login.dto"
import {
  type PermissionShortDto,
  type UserDataDto,
} from "../../dto/user-data.dto"
import { createAppSlice } from "../createAppSlice"

export type CurrentUserSliceState = {
  accessToken?: string
  username?: string
  permissions?: PermissionShortDto[]
}

const getFromLocalStorage = (
  key: keyof CurrentUserSliceState,
): { [key]?: string | PermissionShortDto[] } => {
  const value = localStorage.getItem(key)
  if (!value) {
    return {}
  }
  switch (key) {
    case "permissions":
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { [key]: JSON.parse(value) }
    default:
      return { [key]: value }
  }
}

const initialState: CurrentUserSliceState = {
  ...getFromLocalStorage("accessToken"),
  ...getFromLocalStorage("username"),
  ...getFromLocalStorage("permissions"),
}

export const currentUserSlice = createAppSlice({
  name: "currentUser",
  initialState,
  reducers: create => ({
    login: create.reducer(
      (state: CurrentUserSliceState, action: PayloadAction<LoginDto>) => {
        state.accessToken = action.payload.accessToken
        localStorage.setItem("accessToken", state.accessToken)
      },
    ),
    setUserData: create.reducer(
      (state: CurrentUserSliceState, action: PayloadAction<UserDataDto>) => {
        state.username = action.payload.username
        state.permissions = action.payload.permissions
        localStorage.setItem("username", action.payload.username)
        localStorage.setItem(
          "permissions",
          JSON.stringify(action.payload.permissions),
        )
      },
    ),
    logout: create.reducer((state: CurrentUserSliceState) => {
      delete state.accessToken
      delete state.username
      delete state.permissions
      localStorage.removeItem("accessToken")
      localStorage.removeItem("username")
      localStorage.removeItem("permissions")
    }),
  }),
  selectors: {
    selectAccessToken: currentUser => currentUser.accessToken,
    selectUsername: currentUser => currentUser.username,
    selectPermissions: currentUser => currentUser.permissions,
  },
})

// Action creators are generated for each case reducer function.
export const { login, setUserData, logout } = currentUserSlice.actions

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectAccessToken, selectUsername, selectPermissions } =
  currentUserSlice.selectors
