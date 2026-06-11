export interface LocationDto {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  isGameId: boolean;
  createdOn: string;
  updatedOn: string;
}
