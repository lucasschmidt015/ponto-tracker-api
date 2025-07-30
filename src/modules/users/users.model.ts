import {
	Column,
	Model,
	Table,
	DataType,
	HasMany,
	ForeignKey,
	BelongsTo,
} from 'sequelize-typescript';
import { UserRoles } from '../user-roles/user-roles.model';
import { Companies } from '../companies/companies.model';
import { Entries } from '../entries/entries.model';
import { EntriesApproval } from '../entries_approval/entries_approval.model';

@Table
export class Users extends Model {
	@Column({
		primaryKey: true,
		type: DataType.STRING(36),
	})
	_id: string;

	@Column({
		type: DataType.STRING(255),
	})
	name: string;

	@Column({
		type: DataType.STRING(255),
	})
	email: string;

	@Column({
		type: DataType.DATE,
	})
	birthday_date: Date;

	@Column({
		type: DataType.STRING(255),
	})
	password: string;

	@ForeignKey(() => Companies)
	@Column({
		type: DataType.STRING(36),
		allowNull: false,
	})
	company_id: string;

	@BelongsTo(() => Companies)
	company: Companies;

	@HasMany(() => UserRoles)
	userRoles: UserRoles[];

	@HasMany(() => Entries, { foreignKey: 'user_id' })
	entries: Entries[];

	@HasMany(() => EntriesApproval, { foreignKey: 'approval_user_id' })
	entries_approval: EntriesApproval[];
}
