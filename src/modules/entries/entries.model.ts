import {
	Column,
	Model,
	Table,
	DataType,
	PrimaryKey,
	ForeignKey,
	BelongsTo,
	HasOne,
} from 'sequelize-typescript';

import { Users } from '../users/users.model';

import { WorkingDays } from '../working-days/working-days.model';

import { EntriesApproval } from '../entries_approval/entries_approval.model';

@Table
export class Entries extends Model {
	@PrimaryKey
	@Column({
		primaryKey: true,
		type: DataType.STRING(36),
	})
	_id: string;

	//This field will store both the date and the time
	@Column({
		type: DataType.DATE,
		allowNull: false,
	})
	entry_time: string;

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: false,
	})
	is_approved: boolean;

	@Column({
		type: DataType.STRING(50),
	})
	latitude: string;

	@Column({
		type: DataType.STRING(50),
	})
	longitude: string;

	@ForeignKey(() => WorkingDays)
	@Column({
		type: DataType.STRING(36),
		allowNull: false,
	})
	working_day_id: string;

	@BelongsTo(() => WorkingDays)
	working_day: WorkingDays;

	@ForeignKey(() => Users)
	@Column({
		type: DataType.STRING(36),
		allowNull: false,
	})
	user_id: string;

	@BelongsTo(() => Users, { foreignKey: 'user_id' })
	user: Users;

	@HasOne(() => EntriesApproval, { foreignKey: 'entry_id' })
	entry_approval: EntriesApproval;
}
