export interface LocationDto {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  path: string[];
  pathIds: string[];
  createdOn: string;
  updatedOn: string;
}
