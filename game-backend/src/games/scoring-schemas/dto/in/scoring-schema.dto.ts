export interface ScoringSchemaDto {
  id: string;
  name: string;
  schema: object;
  description?: string | null;
  createdOn: string;
  updatedOn: string;
}
