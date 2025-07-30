import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { WorkingDaysService } from './working-days.service';
import { ListAllWorkingDaysDto } from './dto/list-working-days.dto';
import { CreateWorkingDayToUserDto } from './dto/create-working-day-user.dto';
import { UserOwnsResourceGuard } from 'src/reusable-guards/user-owns-resource.guard';

@Controller('working-days')
export class WorkingDaysController {
	constructor(private workingDaysService: WorkingDaysService) {}

	@UseGuards(UserOwnsResourceGuard('user_id', 'query'))
	@Get()
	listWorkingDays(@Query() filters: ListAllWorkingDaysDto) {
		return this.workingDaysService.listWorkingDays(filters);
	}

	@UseGuards(UserOwnsResourceGuard('user_id'))
	@Post()
	createWorkingDayToUser(@Body() workingDay: CreateWorkingDayToUserDto) {
		return this.workingDaysService.createWorkingDayToUser(workingDay);
	}
}
