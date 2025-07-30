import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { Users } from '../users/users.model';

@Table
export class Companies extends Model {
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
		type: DataType.STRING(50),
	})
	latitude: string;

	@Column({
		type: DataType.STRING(50),
	})
	longitude: string;

	@Column
	allow_entry_out_range: boolean;

	@Column({
		type: DataType.TIME,
	})
	start_time_morning: Date;

	@Column({
		type: DataType.TIME,
	})
	start_time_afternoon: Date;

	@Column({
		type: DataType.TIME,
	})
	end_time_morning: Date;

	@Column({
		type: DataType.TIME,
	})
	end_time_afternoon: Date;

	@Column({
		type: DataType.INTEGER,
	})
	register_range_meters: number;

	@HasMany(() => Users)
	users: Users[];
}
