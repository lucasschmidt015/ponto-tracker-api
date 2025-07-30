import {
	Column,
	Model,
	Table,
	DataType,
	PrimaryKey,
	ForeignKey,
	BelongsTo,
} from 'sequelize-typescript';
import { Users } from '../users/users.model';
import { Entries } from '../entries/entries.model';

@Table
export class EntriesApproval extends Model {
	@PrimaryKey
	@Column({
		primaryKey: true,
		type: DataType.STRING(36),
	})
	_id: string;

	@Column({
		type: DataType.TEXT,
	})
	justificative: string;

	@Column({
		type: DataType.DATE,
	})
	approval_date: Date;

	@ForeignKey(() => Users)
	@Column({ type: DataType.STRING(36) })
	approval_user_id: string;

	@BelongsTo(() => Users, { foreignKey: 'approval_user_id' })
	approval_user: Users;

	@ForeignKey(() => Entries)
	@Column({ type: DataType.STRING(36) })
	entry_id: string;

	@BelongsTo(() => Entries, { foreignKey: 'entry_id' })
	entry: Entries;
}
