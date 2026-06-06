import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { CreateRoleDto } from '@auth/modules/roles/dto/in/create-role.dto';
import { RoleDto } from '@auth/modules/roles/dto/in/role.dto';
import { UpdateRoleDto } from '@auth/modules/roles/dto/in/update-role.dto';
import { Pagination } from '@common/pagination/pagination';
import { DbSearchDto } from '@db/dto/search.dto';

import { RoleRepository } from '../../repositories/role.repository';
import { PostgresConnection } from './PostgresConnection';
import { PostgresConnector } from './PostgresConnector';

@Injectable()
export class PostgresRoleRepository implements RoleRepository {
  private SELECT_ROLES_WHERE_PARTIAL_SQL = (args?: DbSearchDto): string => {
    return `(
     SELECT 
        id,
        name,
        description,
        protected
     FROM roles 
     ${this.connector.searchSQL(args)}
    ) r`;
  };

  private SELECT_ROLES_SQL = (args?: DbSearchDto): string => `
     SELECT 
        r.id,
        r.name,
        r.description,
        r.protected as "protectedRole",
        role_permissions_helper.permissions
     FROM ${this.SELECT_ROLES_WHERE_PARTIAL_SQL(args)}
     JOIN (
        SELECT 
           rp.role_id,
           json_agg(
              json_build_object(
                 'description', p.description,
                 'permissionType', p.type,
                 'permissionLevel', rp.permission_level
              )
           ) AS permissions
        FROM roles_permissions rp
        JOIN permissions p 
           ON rp.permission_type = p.type
        GROUP BY rp.role_id
     ) role_permissions_helper 
        ON role_permissions_helper.role_id = r.id;
    `;

  private SELECT_ROLES_COUNT_SQL: string = `SELECT COUNT(*) AS total FROM roles;`;

  private CREATE_ROLE_SQL: string = `
     INSERT INTO roles (id, name, description)
     VALUES ($1, $2, $3)
     RETURNING id, name, description, protected as "protectedRole";
    `;

  private CREATE_ROLE_PERMISSIONS_SQL = (total: number): string => `
     INSERT INTO roles_permissions (role_id, permission_type, permission_level)
     VALUES ${Array.from({ length: total }).map((_, index) => `($1, $${index * 2 + 2}, $${index * 2 + 3})`)};
    `;

  private UPDATE_ROLE_SQL = (input: UpdateRoleDto): string => {
    const valuesToSet: string[] = [];
    if (input.name) {
      valuesToSet.push('name');
    }
    if (input.description) {
      valuesToSet.push('description');
    }
    return `
     UPDATE roles
     SET
        ${valuesToSet.map((value, index) => `${value} = $${index + 2}`)}
     WHERE id = $1;
    `;
  };

  private DELETE_ROLE_SQL: string = `
   DELETE FROM roles
   WHERE id = $1;
  `;

  private DELETE_ROLE_PERMISSIONS_SQL: string = `
   DELETE FROM roles_permissions
   WHERE role_id = $1;
  `;

  constructor(private readonly connector: PostgresConnector) {}

  public async getRoleById(roleId: string): Promise<RoleDto | null> {
    return this.connector.getOne<RoleDto>(
      this.SELECT_ROLES_SQL({
        where: `id = $1`,
      }),
      [roleId],
    );
  }

  public async getRoleByName(roleName: string): Promise<RoleDto | null> {
    return this.connector.getOne<RoleDto>(
      this.SELECT_ROLES_SQL({
        where: `name = $1`,
      }),
      [roleName],
    );
  }

  public async getManyRoles(pagination?: Pagination): Promise<RoleDto[]> {
    return this.connector.getMany<RoleDto>(
      this.SELECT_ROLES_SQL({
        pagination,
      }),
    );
  }

  public async getAllRolesCount(): Promise<number> {
    return this.connector.getCount(this.SELECT_ROLES_COUNT_SQL);
  }

  private async createRolePermissions(
    connection: PostgresConnection,
    id: string,
    input: CreateRoleDto | UpdateRoleDto,
  ) {
    return connection.query(
      this.CREATE_ROLE_PERMISSIONS_SQL(input.permissions.length),
      [
        id,
        ...input.permissions.flatMap((permission) => [
          permission.permissionType,
          permission.permissionLevel,
        ]),
      ],
    );
  }

  public async createRole(input: CreateRoleDto): Promise<RoleDto> {
    const connection = await this.connector.getConnection();
    await connection.query('BEGIN;');
    try {
      const id = createId();
      await connection.query<RoleDto>(this.CREATE_ROLE_SQL, [
        id,
        input.name,
        input.description,
      ]);
      await this.createRolePermissions(connection, id, input);
      await connection.query('COMMIT;');
      return this.getRoleById(id);
    } catch (error) {
      await connection.query('ROLLBACK;');
      throw error;
    } finally {
      connection.release();
    }
  }

  public async updateRole(
    roleId: string,
    input: UpdateRoleDto,
  ): Promise<RoleDto | null> {
    const connection = await this.connector.getConnection();
    await connection.query('BEGIN;');
    try {
      if (input.name !== undefined || input.description !== undefined) {
        await connection.query<RoleDto>(
          this.UPDATE_ROLE_SQL(input),
          [roleId, input.name, input.description].filter(Boolean),
        );
      }
      // Since each role has to have at least one permission, only remove
      // and recreate role permissions if any are given.
      if (input.permissions !== undefined && input.permissions.length) {
        await connection.query(this.DELETE_ROLE_PERMISSIONS_SQL, [roleId]);
        await this.createRolePermissions(connection, roleId, input);
      }
      await connection.query('COMMIT;');
      return this.getRoleById(roleId);
    } catch (error) {
      await connection.query('ROLLBACK;');
      throw error;
    } finally {
      connection.release();
    }
  }

  public async deleteRole(roleId: string): Promise<RoleDto | null> {
    const connection = await this.connector.getConnection();
    await connection.query('BEGIN;');
    try {
      const roleToDelete = await this.getRoleById(roleId);
      if (roleToDelete !== null) {
        await connection.query<RoleDto>(this.DELETE_ROLE_SQL, [roleId]);
        await connection.query(this.DELETE_ROLE_PERMISSIONS_SQL, [roleId]);
        await connection.query('COMMIT;');
      }
      return roleToDelete;
    } catch (error) {
      await connection.query('ROLLBACK;');
      throw error;
    } finally {
      connection.release();
    }
  }
}
