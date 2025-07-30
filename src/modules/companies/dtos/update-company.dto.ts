import {
	IsString,
	MinLength,
	Matches,
	IsOptional,
	IsBoolean,
	IsNumber,
} from 'class-validator';

export class UpdateCompanyDto {
	@IsOptional()
	@IsString()
	@MinLength(1)
	name: string;

	@IsOptional()
	@IsString()
	latitude?: string;

	@IsOptional()
	@IsString()
	longitude?: string;

	@IsOptional()
	@IsBoolean()
	allow_entry_out_range: boolean;

	@IsOptional()
	@Matches(/^\d{2}:\d{2}$/, {
		message: 'start_time_morning must be in the format HH:mm (e.g. 08:30)',
	})
	start_time_morning: string;

	@IsOptional()
	@Matches(/^\d{2}:\d{2}$/, {
		message: 'start_time_afternoon must be in the format HH:mm (e.g. 13:30)',
	})
	start_time_afternoon: string;

	@IsOptional()
	@Matches(/^\d{2}:\d{2}$/, {
		message: 'end_time_morning must be in the format HH:mm (e.g. 11:30)',
	})
	end_time_morning: string;

	@IsOptional()
	@Matches(/^\d{2}:\d{2}$/, {
		message: 'end_time_afternoon must be in the format HH:mm (e.g. 17:30)',
	})
	end_time_afternoon: string;

	@IsOptional()
	@IsNumber()
	register_range_meters?: number;
}
