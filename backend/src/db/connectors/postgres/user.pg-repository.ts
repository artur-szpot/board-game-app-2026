import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { CreateUserDto } from '@auth/modules/users/dto/in/create-user.dto';
import { UpdateUserDto } from '@auth/modules/users/dto/in/update-user.dto';
import { UserDto } from '@auth/modules/users/dto/in/user.dto';
import { Pagination } from '@common/pagination/pagination';

import { DbSearchDto } from '../../dto/search.dto';
import { UserRepository } from '../../repositories/user.repository';
import { PostgresConnection } from './PostgresConnection';
import { PostgresConnector } from './PostgresConnector';

@Injectable()
export class PostgresUserRepository implements UserRepository {
  private SELECT_USERS_WHERE_PARTIAL_SQL = (args?: DbSearchDto): string => {
    return `(
     SELECT 
        id,
        username,
        password,
        email,
        joined_date
     FROM users 
     ${this.connector.searchSQL(args)}
    ) u`;
  };

  private SELECT_USERS_SQL = (args?: DbSearchDto): string => `
   SELECT 
      u.id,
      u.username,
      u.password,
      u.email,
      u.joined_date as "joinedDate",
      json_agg(
         json_build_object(
            'id', r.id,
            'name', r.name,
            'description', r.description,
            'protectedRole', r.protected,
            'permissions', role_permissions_helper.permissions
         )
      ) AS roles
   FROM ${this.SELECT_USERS_WHERE_PARTIAL_SQL(args)}
   JOIN users_roles ur 
      ON u.id = ur.user_id
   JOIN roles r 
      ON ur.role_id = r.id
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
      ON role_permissions_helper.role_id = r.id
   GROUP BY u.id, u.username, u.password, u.email, u.joined_date;
  `;

  private SELECT_USERS_COUNT_SQL: string = `SELECT COUNT(*) AS total FROM users;`;

  private CREATE_USER_SQL: string = `
     INSERT INTO users (id, email, username, password)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, username, password, joined_date as "joinedDate";
    `;

  private CREATE_USER_ROLES_SQL = (total: number): string => `
     INSERT INTO users_roles (user_id, role_id)
     VALUES ${Array.from({ length: total }).map((_, index) => `($1, $${index + 2})`)};
    `;

  private UPDATE_USER_SQL = (input: UpdateUserDto): string => {
    const valuesToSet: string[] = [];
    if (input.username) {
      valuesToSet.push('username');
    }
    if (input.password) {
      valuesToSet.push('password');
    }
    return `
     UPDATE users
     SET
        ${valuesToSet.map((value, index) => `${value} = $${index + 2}`)}
     WHERE id = $1;
    `;
  };

  private DELETE_USER_SQL: string = `
   DELETE FROM users
   WHERE id = $1;
  `;

  private DELETE_USER_ROLES_SQL: string = `
   DELETE FROM users_roles
   WHERE user_id = $1;
  `;

  constructor(private readonly connector: PostgresConnector) {}

  public async getUserById(userId: string): Promise<UserDto | null> {
    return this.connector.getOne<UserDto>(
      this.SELECT_USERS_SQL({ where: `id = $1` }),
      [userId],
    );
  }

  public async getUserByUsername(username: string): Promise<UserDto | null> {
    return this.connector.getOne<UserDto>(
      this.SELECT_USERS_SQL({ where: `username = $1` }),
      [username],
    );
  }

  public async getUserByEmail(email: string): Promise<UserDto | null> {
    return this.connector.getOne<UserDto>(
      this.SELECT_USERS_SQL({ where: `email = $1` }),
      [email],
    );
  }

  public async getManyUsers(pagination?: Pagination): Promise<UserDto[]> {
    return this.connector.getMany<UserDto>(
      this.SELECT_USERS_SQL({
        orderBy: 'username ASC',
        pagination,
      }),
    );
  }

  public async getAllUsersCount(): Promise<number> {
    return this.connector.getCount(this.SELECT_USERS_COUNT_SQL);
  }

  private async createUserRoles(
    connection: PostgresConnection,
    id: string,
    input: CreateUserDto | UpdateUserDto,
  ) {
    return connection.query(this.CREATE_USER_ROLES_SQL(input.roles.length), [
      id,
      ...input.roles.map((role) => [role.roleId]),
    ]);
  }

  public async createUser(input: CreateUserDto): Promise<UserDto> {
    const connection = await this.connector.getConnection();
    await connection.query('BEGIN;');
    try {
      const id = createId();
      await connection.query<UserDto>(this.CREATE_USER_SQL, [
        id,
        input.email,
        input.username,
        input.password,
      ]);
      await this.createUserRoles(connection, id, input);
      await connection.query('COMMIT;');
      return this.getUserById(id);
    } catch (error) {
      await connection.query('ROLLBACK;');
      throw error;
    } finally {
      connection.release();
    }
  }

  public async updateUser(
    userId: string,
    input: UpdateUserDto,
  ): Promise<UserDto> {
    const connection = await this.connector.getConnection();
    await connection.query('BEGIN;');
    try {
      if (input.username !== undefined || input.password !== undefined) {
        await connection.query<UserDto>(
          this.UPDATE_USER_SQL(input),
          [userId, input.username, input.password].filter(Boolean),
        );
      }
      // Since each user has to have at least one role, only remove
      // and recreate user roles if any are given.
      if (input.roles !== undefined && input.roles.length) {
        await connection.query(this.DELETE_USER_ROLES_SQL, [userId]);
        await this.createUserRoles(connection, userId, input);
      }
      await connection.query('COMMIT;');
      return this.getUserById(userId);
    } catch (error) {
      await connection.query('ROLLBACK;');
      throw error;
    } finally {
      connection.release();
    }
  }

  public async deleteUser(userId: string): Promise<UserDto> {
    const connection = await this.connector.getConnection();
    await connection.query('BEGIN;');
    try {
      const userToDelete = await this.getUserById(userId);
      if (userToDelete !== null) {
        await connection.query<UserDto>(this.DELETE_USER_SQL, [userId]);
        await connection.query(this.DELETE_USER_ROLES_SQL, [userId]);
        await connection.query('COMMIT;');
      }
      return userToDelete;
    } catch (error) {
      await connection.query('ROLLBACK;');
      throw error;
    } finally {
      connection.release();
    }
  }
}
