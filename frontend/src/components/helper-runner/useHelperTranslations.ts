import axios from "axios";
import { useEffect, useMemo, useState } from "react";

import type { HelperLogic, SetDataDto } from "../../dto/helper-logic.dto";
import type { Language } from "../../store/features/settingsSlice";
import {
    buildTranslate,
    collectLabelKeys,
    type Translate,
    UI_DEFAULTS,
} from "./helper-i18n";

type LookupResponse = {
  translations: Record<string, string>;
  missing: string[];
};

export type HelperTranslations = {
  translate: Translate;
  /** Keys without a translation and without a built-in default. */
  missing: string[];
};

export const useHelperTranslations = (
  logic: HelperLogic,
  sets: Record<string, SetDataDto>,
  language: Language,
  accessToken?: string,
): HelperTranslations => {
  const [response, setResponse] = useState<LookupResponse>({
    translations: {},
    missing: [],
  });
  const keys = useMemo(() => collectLabelKeys(logic, sets), [logic, sets]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = await axios.post<LookupResponse>(
          `${import.meta.env.VITE_API_URL as string}/game-api/translations/lookup`,
          { keys, language },
          {
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : undefined,
          },
        );
        if (!cancelled) {
          setResponse(result.data);
        }
      } catch {
        if (!cancelled) {
          setResponse({ translations: {}, missing: keys });
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [accessToken, keys, language]);

  return useMemo(
    () => ({
      translate: buildTranslate(response.translations),
      missing: response.missing.filter(key => !(key in UI_DEFAULTS)),
    }),
    [response],
  );
};
