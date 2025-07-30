import {
	Column,
	Model,
	Table,
	DataType,
	ForeignKey,
	BelongsTo,
	HasMany,
} from 'sequelize-typescript';

import { Users } from '../users/users.model';
import { Companies } from '../companies/companies.model';
import { Entries } from '../entries/entries.model';

@Table
export class WorkingDays extends Model {
	@Column({
		primaryKey: true,
		type: DataType.STRING(36),
	})
	_id: string;

	//This stores how much time the user worked on a day
	@Column({
		type: DataType.INTEGER,
	})
	worked_time: number;

	@Column({
		type: DataType.DATEONLY,
		allowNull: false,
	})
	worked_date: Date;

	@Column({
		type: DataType.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	})
	finished: boolean;

	@ForeignKey(() => Users)
	@Column({
		type: DataType.STRING(36),
		allowNull: false,
	})
	user_id: string;

	@BelongsTo(() => Users)
	user: Users;

	@ForeignKey(() => Companies)
	@Column({
		type: DataType.STRING(36),
		allowNull: false,
	})
	company_id: string;

	@BelongsTo(() => Companies)
	company: Companies;

	@HasMany(() => Entries)
	entries: Entries[];
}
