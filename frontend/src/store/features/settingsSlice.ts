import type { PayloadAction } from "@reduxjs/toolkit";

import { createAppSlice } from "../createAppSlice";

export const SUPPORTED_LANGUAGES = ["en", "pl"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = "language";

const isLanguage = (value: unknown): value is Language =>
  SUPPORTED_LANGUAGES.includes(value as Language);

export type SettingsSliceState = {
  language: Language;
};

const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

const initialState: SettingsSliceState = {
  language: isLanguage(storedLanguage) ? storedLanguage : "en",
};

export const settingsSlice = createAppSlice({
  name: "settings",
  initialState,
  reducers: create => ({
    setLanguage: create.reducer(
      (state: SettingsSliceState, action: PayloadAction<Language>) => {
        state.language = action.payload;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, action.payload);
      },
    ),
  }),
  selectors: {
    selectLanguage: settings => settings.language,
  },
});

export const { setLanguage } = settingsSlice.actions;
export const { selectLanguage } = settingsSlice.selectors;
