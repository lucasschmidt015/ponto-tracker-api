import {
	Column,
	Model,
	Table,
	DataType,
	ForeignKey,
	BelongsTo,
} from 'sequelize-typescript';
import { Users } from '../users/users.model';

@Table
export class AuthToken extends Model {
	@Column({
		primaryKey: true,
		type: DataType.STRING(36),
	})
	_id: string;

	@Column({
		type: DataType.TEXT,
		allowNull: false,
	})
	token: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	type: string;

	@ForeignKey(() => Users)
	@Column({
		type: DataType.STRING(36),
		allowNull: false,
	})
	user_id: string;

	@BelongsTo(() => Users)
	user: Users;

	@Column({
		type: DataType.DATE,
		allowNull: false,
	})
	expires_at: Date;

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: false,
	})
	revoked: boolean;
}
