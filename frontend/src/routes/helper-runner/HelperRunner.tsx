import { Alert, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { randomizerApi } from "../../api/randomizer";
import { HelperRunnerView } from "../../components/helper-runner/HelperRunnerView";
import type {
    HelperResponseDto,
    SetResponseDto,
} from "../../dto/collection-items.dto";
import type { SetDataDto } from "../../dto/helper-logic.dto";
import { selectAccessToken } from "../../store/features/currentUserSlice";
import { useAppSelector } from "../../store/hooks";

type LoadedHelper = {
  helper: HelperResponseDto;
  sets: Record<string, SetDataDto>;
};

export const HelperRunner = () => {
  const { id: helperId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const accessToken = useAppSelector(selectAccessToken);
  const [loaded, setLoaded] = useState<LoadedHelper | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!helperId) {
      return;
    }
    let cancelled = false;
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;
    const baseUrl = `${import.meta.env.VITE_API_URL as string}/game-api`;

    const load = async () => {
      setLoaded(undefined);
      setError(undefined);
      try {
        const { data: helper } = await axios.get<HelperResponseDto>(
          `${baseUrl}/helpers/${helperId}`,
          { headers },
        );
        const setEntries = await Promise.all(
          Object.entries(helper.logic.sets).map(async ([alias, setId]) => {
            const { data } = await axios.get<SetResponseDto>(
              `${baseUrl}/sets/${setId}`,
              { headers },
            );
            return [alias, data.data] as const;
          }),
        );
        if (!cancelled) {
          setLoaded({ helper, sets: Object.fromEntries(setEntries) });
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load helper");
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [accessToken, helperId]);

  if (!helperId) {
    return <Alert severity="error">404</Alert>;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!loaded) {
    return <Typography>Loading helper...</Typography>;
  }

  return (
    <HelperRunnerView
      key={loaded.helper.id}
      name={loaded.helper.name}
      logic={loaded.helper.logic}
      sets={loaded.sets}
      api={randomizerApi}
      onClose={() => void navigate(-1)}
    />
  );
};
