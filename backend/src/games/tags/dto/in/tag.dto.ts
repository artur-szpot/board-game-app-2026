export interface TagDto {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  createdOn: string;
  updatedOn: string;
}
