import axios from "axios";

export type NamedItem = { id: string; name: string };

type ChooseResponse = { chosen: number[]; left: number[] };

const url = (path: string) =>
  `${import.meta.env.VITE_RANDOMIZER_URL as string}/${path}`;

const authHeaders = (accessToken?: string) =>
  accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;

export const randomizerApi = {
  getTeams: async (accessToken?: string): Promise<NamedItem[]> => {
    const response = await axios.get<NamedItem[]>(url("teams"), {
      headers: authHeaders(accessToken),
    });
    return response.data;
  },

  getPlayers: async (
    teamId: string,
    accessToken?: string,
  ): Promise<NamedItem[]> => {
    const response = await axios.get<NamedItem[]>(url("players"), {
      params: { team_id: teamId },
      headers: authHeaders(accessToken),
    });
    return response.data;
  },

  rollDice: async (
    count: number,
    sides: number,
    accessToken?: string,
  ): Promise<number[]> => {
    const response = await axios.get<Record<string, number[]>>(url("dice"), {
      params: { dice_query: `${count.toString()}d${sides.toString()}` },
      headers: authHeaders(accessToken),
    });
    return response.data[`d${sides.toString()}`] ?? [];
  },

  choose: async (
    items: number[],
    count: number,
    accessToken?: string,
  ): Promise<number[]> => {
    const response = await axios.post<ChooseResponse>(
      url("choose"),
      { total: null, items, choose: count, shuffle: true },
      { headers: authHeaders(accessToken) },
    );
    return response.data.chosen;
  },
};

export type RandomizerApi = typeof randomizerApi;
