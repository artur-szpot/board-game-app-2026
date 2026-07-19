export interface LocationDto {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  createdOn: string;
  updatedOn: string;
}
