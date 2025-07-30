import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	Delete,
	Patch,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { Roles } from 'src/custom-decorators/roles';

@Roles('master')
@Controller('companies')
export class CompaniesController {
	constructor(private companiesService: CompaniesService) {}

	@Get('/:id')
	findOne(@Param('id') id: string) {
		return this.companiesService.findOne(id);
	}

	@Get()
	findAll() {
		return this.companiesService.findAll();
	}

	@Post()
	create(@Body() createCompany: CreateCompanyDto) {
		return this.companiesService.create(createCompany);
	}

	@Patch('/:id')
	update(@Param('id') id: string, @Body() company: UpdateCompanyDto) {
		return this.companiesService.update(id, company);
	}

	@Delete('/:id')
	delete(@Param('id') id: string) {
		return this.companiesService.delete(id);
	}
}
