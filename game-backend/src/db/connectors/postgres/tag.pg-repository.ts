import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { SYSTEM_OWNER_ID } from '@common/constants/system-owner';
import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import { CustomNotFoundError } from '@common/errors/service-errors';

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
      owner_id AS "ownerId",
      private,
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
      INSERT INTO tags (id, owner_id, private, name, description, parent_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, owner_id AS "ownerId", private, name, description, parent_id AS "parentId", created_on AS "createdOn", updated_on AS "updatedOn";
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
    if (input.private !== undefined) {
      valuesToSet.push('private = $' + (valuesToSet.length + 2));
    }
    return `
      UPDATE tags
      SET
         ${valuesToSet.join(', ')},
         updated_on = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, owner_id AS "ownerId", private, name, description, parent_id AS "parentId", created_on AS "createdOn", updated_on AS "updatedOn";
    `;
  };

  private readonly DELETE_TAG_SQL = `
   DELETE FROM tags
   WHERE id = $1
    RETURNING id, owner_id AS "ownerId", private, name, description, parent_id AS "parentId", created_on AS "createdOn", updated_on AS "updatedOn";
  `;

  private readonly MAKE_TAG_SYSTEM_OWNED_SQL = `
   UPDATE tags
   SET
      owner_id = $2,
      private = false,
      updated_on = CURRENT_TIMESTAMP
   WHERE id = $1
   RETURNING id, owner_id AS "ownerId", private, name, description, parent_id AS "parentId", created_on AS "createdOn", updated_on AS "updatedOn";
  `;

  constructor(private readonly connector: PostgresConnector) {}

  private buildOrderBy(sort?: GetManyItemsDto['sort']): string {
    const sortableFields: Record<string, string> = {
      name: 'name',
      createdOn: 'created_on',
      updatedOn: 'updated_on',
    };

    // TODO: validate incoming sort keys and directions centrally instead of silently ignoring unsupported values.
    const clauses = Object.entries(sort ?? {})
      .filter(
        ([field, direction]) =>
          sortableFields[field] &&
          (direction === 'asc' || direction === 'desc'),
      )
      .map(
        ([field, direction]) =>
          `${sortableFields[field]} ${direction.toUpperCase()}`,
      );

    return clauses.length > 0 ? clauses.join(', ') : 'name ASC';
  }

  private buildSearchArgs(dto?: GetManyItemsDto) {
    const {
      pagination,
      searchTerm,
      sort,
      userId,
      hasCollectionSuperuserPermission,
    } = dto ?? {};
    const args: string[] = [];
    const predicates: string[] = [];

    if (searchTerm) {
      args.push(`%${searchTerm}%`);
      predicates.push(
        `(name ILIKE $${args.length} OR COALESCE(description, '') ILIKE $${args.length})`,
      );
    }

    if (userId && !hasCollectionSuperuserPermission) {
      args.push(userId);
      const userIdParameter = args.length;
      args.push(SYSTEM_OWNER_ID);
      predicates.push(
        `(owner_id = $${userIdParameter} OR owner_id = $${args.length})`,
      );
    }

    const where = predicates.length ? predicates.join(' AND ') : undefined;
    const orderBy = this.buildOrderBy(sort);

    return { pagination, args: args.length ? args : undefined, orderBy, where };
  }

  public async getTagById(
    tagId: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagDto | null> {
    const { userId, hasCollectionSuperuserPermission } = itemOwnership ?? {};
    const args: string[] = [tagId];
    let where = 'id = $1';

    if (userId && !hasCollectionSuperuserPermission) {
      args.push(userId);
      const userIdParameter = args.length;
      args.push(SYSTEM_OWNER_ID);
      where += ` AND (owner_id = $${userIdParameter} OR owner_id = $${args.length})`;
    }

    return this.connector.getOne<TagDto>(
      `${this.SELECT_TAGS_SQL} WHERE ${where}`,
      args,
    );
  }

  public async getTagsByIds(
    tagIds: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagDto[]> {
    const { userId, hasCollectionSuperuserPermission } = itemOwnership ?? {};
    if (tagIds.length === 0) {
      return [];
    }

    const args: (string[] | string)[] = [tagIds];
    let where = 'id IN $1';

    if (userId && !hasCollectionSuperuserPermission) {
      args.push(userId);
      const userIdParameter = args.length;
      args.push(SYSTEM_OWNER_ID);
      where += ` AND (owner_id = $${userIdParameter} OR owner_id = $${args.length})`;
    }

    return this.connector.getMany<TagDto>(
      `${this.SELECT_TAGS_SQL} WHERE ${where}`,
      args,
    );
  }

  public async getTagByName(
    name: string,
    ownerId: string,
  ): Promise<TagDto | null> {
    return this.connector.getOne<TagDto>(
      `${this.SELECT_TAGS_SQL} WHERE name = $1 AND owner_id = $2`,
      [name, ownerId],
    );
  }

  public async getManyTags(dto?: GetManyItemsDto): Promise<TagDto[]> {
    const { pagination, args, orderBy, where } = this.buildSearchArgs(dto);
    return this.connector.getMany<TagDto>(
      `${this.SELECT_TAGS_SQL} ${this.connector.searchSQL({
        where,
        orderBy,
        pagination,
      })}`,
      args,
    );
  }

  public async getTagsCount(dto?: GetManyItemsDto): Promise<number> {
    const { args, where } = this.buildSearchArgs(dto);
    const query = where
      ? `SELECT COUNT(*) AS total FROM tags WHERE ${where};`
      : this.SELECT_TAGS_COUNT_SQL;
    return this.connector.getCount(query, args);
  }

  public async createTag(
    input: CreateTagDto,
    ownerId: string,
    isPrivate = true,
  ): Promise<TagDto> {
    const id = createId();
    const result = await this.connector.getOne<TagDto>(this.CREATE_TAG_SQL, [
      id,
      ownerId,
      isPrivate,
      input.name,
      input.description ?? null,
      input.parentId ?? null,
    ]);
    return result;
  }

  public async updateTag(
    tagId: string,
    input: UpdateTagDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagDto> {
    const existing = await this.getTagById(tagId, itemOwnership);

    if (!existing) {
      throw new CustomNotFoundError(`tag with ID "${tagId}"`);
    }

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
    if (input.private !== undefined) {
      parameters.push(input.private);
    }

    return this.connector.getOne<TagDto>(
      this.UPDATE_TAG_SQL(input),
      parameters,
    );
  }

  public async deleteTag(
    tagId: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagDto> {
    const existing = await this.getTagById(tagId, itemOwnership);

    if (!existing) {
      throw new CustomNotFoundError(`tag with ID "${tagId}"`);
    }

    return this.connector.getOne<TagDto>(this.DELETE_TAG_SQL, [tagId]);
  }

  public async makeTagSystemOwned(
    tagId: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagDto> {
    const existing = await this.getTagById(tagId, itemOwnership);

    if (!existing) {
      throw new CustomNotFoundError(`tag with ID "${tagId}"`);
    }

    return this.connector.getOne<TagDto>(this.MAKE_TAG_SYSTEM_OWNED_SQL, [
      tagId,
      SYSTEM_OWNER_ID,
    ]);
  }
}
