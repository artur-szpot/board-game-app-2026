import { AdminDataType } from '../../enums/AdminDataType.enum';

export interface AuthSearchResult {
  id: string;
  name: string;
  type: AdminDataType;
  detail?: object;
}

export interface AuthSearchResponse {
  results: AuthSearchResult[];
  total: number;
}
