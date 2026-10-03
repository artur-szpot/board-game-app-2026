import { Alert, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";

import { randomizerApi } from "../../api/randomizer";
import { HelperRunnerView } from "../../components/helper-runner/HelperRunnerView";
import type {
  HelperResponseDto,
  SetResponseDto,
} from "../../dto/collection-items.dto";
import type { RunnerSetDto } from "../../dto/helper-logic.dto";
import { isSetData, SET_IDENTIFIER } from "../../utils/set-data";
import { PermissionType, PermissionLevel } from "../../dto/user-data.dto";
import { useHasRequiredPermissions } from "../../utils/useHasRequiredPermissions";
import { selectAccessToken } from "../../store/features/currentUserSlice";
import { useAppSelector } from "../../store/hooks";

type LoadedHelper = {
  helper: HelperResponseDto;
  sets: Record<string, RunnerSetDto>;
};

export const HelperRunner = () => {
  const { id: helperId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("gameId");
  const canViewData = useHasRequiredPermissions({
    [PermissionType.DATA_MANAGEMENT]: PermissionLevel.READ,
  });
  const accessToken = useAppSelector(selectAccessToken);
  const [loaded, setLoaded] = useState<LoadedHelper | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!helperId || (!gameId && !canViewData)) {
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
        const scoped = gameId
          ? (
              await axios.get<{
                helper: HelperResponseDto;
                sets: SetResponseDto[];
              }>(
                `${baseUrl}/games/${encodeURIComponent(gameId)}/helpers/${encodeURIComponent(helperId)}`,
                { headers },
              )
            ).data
          : undefined;
        const helper =
          scoped?.helper ??
          (
            await axios.get<HelperResponseDto>(
              `${baseUrl}/helpers/${helperId}`,
              { headers },
            )
          ).data;
        const setEntries = await Promise.all(
          Object.entries(helper.logic.sets).map(async ([alias, setId]) => {
            const data = scoped
              ? scoped.sets.find(set => set.id === setId)
              : (
                  await axios.get<SetResponseDto>(`${baseUrl}/sets/${setId}`, {
                    headers,
                  })
                ).data;
            if (!data) {
              throw new Error(
                `Missing data set "${alias}" for the assigned helper`,
              );
            }
            if (!SET_IDENTIFIER.test(data.name) || !isSetData(data.data)) {
              throw new Error(
                `Data set "${data.name}" uses an unsupported format. Replace or recreate it in Helper data sets.`,
              );
            }
            return [alias, { ...data.data, name: data.name }] as const;
          }),
        );
        if (!cancelled) {
          setLoaded({ helper, sets: Object.fromEntries(setEntries) });
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Unable to load helper",
          );
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [accessToken, helperId, gameId, canViewData]);

  if (!helperId) {
    return <Alert severity="error">404</Alert>;
  }
  if (!gameId && !canViewData) {
    return (
      <Alert severity="error">
        DATA_MANAGEMENT READ permission is required. Run assigned helpers from
        game details.
      </Alert>
    );
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
