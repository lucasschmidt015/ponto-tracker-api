import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { UserRoles } from '../user-roles/user-roles.model';

@Table
export class Roles extends Model {
	@Column({
		primaryKey: true,
		type: DataType.STRING(36),
	})
	_id: string;

	@Column({
		type: DataType.STRING(60),
	})
	name: string;

	@HasMany(() => UserRoles)
	userRoles: UserRoles[];
}
