import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';

import { CreateTagDto } from '../../../games/tags/dto/in/create-tag.dto';
import { TagDto } from '../../../games/tags/dto/in/tag.dto';
import { UpdateTagDto } from '../../../games/tags/dto/in/update-tag.dto';
import { TagRepository } from '../../repositories/tag.repository';
import { PostgresConnector } from './PostgresConnector';

@Injectable()
export class PostgresTagRepository implements TagRepository {
  private readonly SELECT_TAGS_SQL = `
   SELECT
      id,
      name,
      description,
      parent_id AS "parentId",
      created_on AS "createdOn",
      updated_on AS "updatedOn"
   FROM tags
  `;

  private readonly SELECT_TAGS_COUNT_SQL =
    'SELECT COUNT(*) AS total FROM tags;';

  private readonly CREATE_TAG_SQL = `
      INSERT INTO tags (id, name, description, parent_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, description, parent_id AS "parentId", created_on AS "createdOn", updated_on AS "updatedOn";
  `;

  private readonly UPDATE_TAG_SQL = (input: UpdateTagDto): string => {
    const valuesToSet: string[] = [];
    if (input.name !== undefined) {
      valuesToSet.push('name = $2');
    }
    if (input.description !== undefined) {
      valuesToSet.push('description = $' + (valuesToSet.length + 2));
    }
    if (input.parentId !== undefined) {
      valuesToSet.push('parent_id = $' + (valuesToSet.length + 2));
    }
    return `
      UPDATE tags
      SET
         ${valuesToSet.join(', ')},
         updated_on = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, description, parent_id AS "parentId", created_on AS "createdOn", updated_on AS "updatedOn";
    `;
  };

  private readonly DELETE_TAG_SQL = `
   DELETE FROM tags
   WHERE id = $1
    RETURNING id, name, description, parent_id AS "parentId", created_on AS "createdOn", updated_on AS "updatedOn";
  `;

  constructor(private readonly connector: PostgresConnector) {}

  public async getTagById(tagId: string): Promise<TagDto | null> {
    return this.connector.getOne<TagDto>(
      `${this.SELECT_TAGS_SQL} WHERE id = $1`,
      [tagId],
    );
  }

  public async getTagsByIds(tagIds: string[]): Promise<TagDto[]> {
    if (tagIds.length === 0) {
      return [];
    }

    return this.connector.getMany<TagDto>(
      `${this.SELECT_TAGS_SQL} WHERE id IN $1`,
      [tagIds],
    );
  }

  public async getTagByName(name: string): Promise<TagDto | null> {
    return this.connector.getOne<TagDto>(
      `${this.SELECT_TAGS_SQL} WHERE name = $1`,
      [name],
    );
  }

  public async getManyTags(dto?: GetManyItemsDto): Promise<TagDto[]> {
    const { pagination } = dto ?? {};
    return this.connector.getMany<TagDto>(
      `${this.SELECT_TAGS_SQL} ${this.connector.searchSQL({
        orderBy: 'name ASC',
        pagination,
      })}`,
    );
  }

  public async getTagsCount(): Promise<number> {
    return this.connector.getCount(this.SELECT_TAGS_COUNT_SQL);
  }

  public async createTag(input: CreateTagDto): Promise<TagDto> {
    const id = createId();
    const result = await this.connector.getOne<TagDto>(this.CREATE_TAG_SQL, [
      id,
      input.name,
      input.description ?? null,
      input.parentId ?? null,
    ]);
    return result;
  }

  public async updateTag(tagId: string, input: UpdateTagDto): Promise<TagDto> {
    const parameters: any[] = [tagId];
    if (input.name !== undefined) {
      parameters.push(input.name);
    }
    if (input.description !== undefined) {
      parameters.push(input.description);
    }
    if (input.parentId !== undefined) {
      parameters.push(input.parentId);
    }

    return this.connector.getOne<TagDto>(
      this.UPDATE_TAG_SQL(input),
      parameters,
    );
  }

  public async deleteTag(tagId: string): Promise<TagDto> {
    return this.connector.getOne<TagDto>(this.DELETE_TAG_SQL, [tagId]);
  }
}
