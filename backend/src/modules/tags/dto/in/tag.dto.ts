export interface TagDto {
  id: string;
  name: string;
  parentId?: string | null;
  createdOn: string;
  updatedOn: string;
}
