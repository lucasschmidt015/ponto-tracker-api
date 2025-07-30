import {
	Column,
	Model,
	Table,
	DataType,
	ForeignKey,
	BelongsTo,
} from 'sequelize-typescript';

import { Users } from '../users/users.model';
import { Roles } from '../roles/roles.model';

@Table
export class UserRoles extends Model {
	@Column({
		primaryKey: true,
		type: DataType.STRING(36),
	})
	_id: string;

	@ForeignKey(() => Users)
	user_id: string;

	@ForeignKey(() => Roles)
	role_id: string;

	@BelongsTo(() => Users)
	user: Users;

	@BelongsTo(() => Roles)
	role: Roles;
}
