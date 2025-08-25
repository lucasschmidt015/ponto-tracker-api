import {
	Controller,
	Post,
	Body,
	UseGuards,
	Get,
	Param,
	Query,
} from '@nestjs/common';
import { EntriesService } from './entries.service';

import { RegisterNewEntryDto } from './dtos/register-new-entry.dto';
import { UserOwnsResourceGuard } from 'src/reusable-guards/user-owns-resource.guard';
import { getCurrentDate, toSaoPauloTime } from '../../common/utils/timezone.util';

@Controller('entries')
export class EntriesController {
	constructor(private entriesService: EntriesService) {}

	@UseGuards(UserOwnsResourceGuard('user_id'))
	@Post()
	registerUserEntry(@Body() entry: RegisterNewEntryDto) {
		return this.entriesService.registerUserEntry(entry);
	}

	@Get(':user_id')
	getUserEntriesByDay(
		@Param('user_id') user_id: string,
		@Query('date') date: string,
	) {
		const entryDate = date ? toSaoPauloTime(date) : getCurrentDate();
		return this.entriesService.getUserEntriesByDay(user_id, entryDate);
	}
}
