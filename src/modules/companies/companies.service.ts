import {
	Injectable,
	ConflictException,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Companies } from './companies.model';
import { v4 as uuidv4 } from 'uuid';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import DestroyedResponse from 'src/types/delete.response';

@Injectable()
export class CompaniesService {
	constructor(
		@InjectModel(Companies) private companiesModule: typeof Companies,
	) {}

	async findOne(_id: string): Promise<Companies | null> {
		const company = await this.companiesModule.findOne({
			where: {
				_id,
			},
		});

		if (!company) {
			throw new NotFoundException(`Company with ID ${_id} not found`);
		}

		return company.get({ plain: true }) as Companies;
	}

	findAll(): Promise<Companies[]> {
		return this.companiesModule.findAll({});
	}

	async create(company: CreateCompanyDto): Promise<Companies> {
		const _id = uuidv4();

		const companyAlreadyExists = await this.companiesModule.findOne({
			where: {
				email: company.email,
			},
		});

		if (companyAlreadyExists) {
			throw new ConflictException('Email already in use');
		}

		return this.companiesModule.create({
			_id,
			...company,
		});
	}

	update(
		_id: string,
		company: UpdateCompanyDto,
	): Promise<[number, Companies[]]> {
		return this.companiesModule.update(company, {
			where: {
				_id,
			},
			returning: true,
		});
	}

	async delete(_id: string): Promise<DestroyedResponse> {
		const companyExists = await this.companiesModule.findByPk(_id);

		if (!companyExists) {
			throw new NotFoundException(`No company was found with id ${_id}`);
		}

		const hasDestroyed = await this.companiesModule.destroy({
			where: {
				_id,
			},
		});

		return {
			_id,
			message: `Company with id ${_id} successfully deleted`,
			success: hasDestroyed,
		};
	}
}
