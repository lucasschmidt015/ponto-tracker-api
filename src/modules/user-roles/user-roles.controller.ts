import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { CreateUserRoleDto } from './dtos/create-user-role.dto';
import { UserRolesService } from './user-roles.service';
import { Roles } from 'src/custom-decorators/roles';

@Roles('master')
@Controller('user-roles')
export class UserRolesController {
	constructor(private userRolesService: UserRolesService) {}

	@Get()
	findAll() {
		return this.userRolesService.findAll();
	}

	@Post()
	create(@Body() createUserRole: CreateUserRoleDto) {
		return this.userRolesService.create(createUserRole);
	}

	@Delete('/:id')
	delete(@Param('id') id: string) {
		return this.userRolesService.delete(id);
	}
}
