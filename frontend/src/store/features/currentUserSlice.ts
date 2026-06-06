import type { PayloadAction } from "@reduxjs/toolkit"

import { type LoginDto } from "../../dto/login.dto"
import { createAppSlice } from "../createAppSlice"

export type CurrentUserSliceState = {
  accessToken?: string
}

const getFromLocalStorage = (key: string): { [key]?: string } => {
  const value = localStorage.getItem(key)
  if (!value) {
    return {}
  }
  return { [key]: value }
}

const initialState: CurrentUserSliceState = {
  ...getFromLocalStorage("accessToken"),
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
  }),
  selectors: {
    selectAccessToken: currentUser => currentUser.accessToken,
  },
})

// Action creators are generated for each case reducer function.
export const { login } = currentUserSlice.actions

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectAccessToken } = currentUserSlice.selectors
