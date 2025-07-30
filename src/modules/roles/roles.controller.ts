import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	Delete,
	Patch,
} from '@nestjs/common';
import { CreateRoleDto } from './dtos/create-role.dto';
import { RolesService } from './roles.service';
import { Roles } from 'src/custom-decorators/roles';

@Roles('master')
@Controller('roles')
export class RolesController {
	constructor(private rolesService: RolesService) {}

	@Get('/:id')
	findOne(@Param('id') id: string) {
		return this.rolesService.findOne(id);
	}

	@Get()
	findAll() {
		return this.rolesService.findAll();
	}

	@Post()
	create(@Body() createRole: CreateRoleDto) {
		return this.rolesService.create(createRole);
	}

	@Patch('/:id')
	update(@Param('id') id: string, @Body() body: CreateRoleDto) {
		return this.rolesService.update(id, body);
	}

	@Delete('/:id')
	delete(@Param('id') id: string) {
		return this.rolesService.delete(id);
	}
}
