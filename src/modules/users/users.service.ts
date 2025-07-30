/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
	Injectable,
	ConflictException,
	NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from './users.model';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { CompaniesService } from '../companies/companies.service';
import DestroyedResponse from 'src/types/delete.response';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(Users) private usersModule: typeof Users,
		private companiesService: CompaniesService,
	) {}

	async findOne(_id: string): Promise<Users | null> {
		const user = await this.usersModule.findOne({
			where: {
				_id,
			},
			attributes: { exclude: ['password'] },
		});

		if (!user) {
			throw new NotFoundException(`User with ID ${_id} not found`);
		}

		return user;
	}

	async findByEmail(email: string): Promise<Users | null> {
		const user = await this.usersModule.findOne({
			where: {
				email,
			},
			include: [
				{
					association: 'userRoles',
					include: ['role'],
				},
				{
					association: 'company',
				},
			],
		});

		if (!user) {
			throw new NotFoundException(`User with email ${email} not found`);
		}

		return user?.get({ plain: true }) ?? null;
	}

	async findUserByIdWithRoles(_id: string): Promise<Users | null> {
		const user = await this.usersModule.findOne({
			where: {
				_id,
			},
			include: [
				{
					association: 'userRoles',
					include: ['role'],
				},
				{
					association: 'company',
				},
			],
			attributes: { exclude: ['password'] },
		});

		if (!user) {
			throw new NotFoundException(`User with ID ${_id} not found`);
		}

		return user?.get({ plain: true }) ?? null;
	}

	findAll(): Promise<Users[]> {
		return this.usersModule.findAll({
			attributes: { exclude: ['password'] },
		});
	}

	async create(user: CreateUserDto): Promise<Users> {
		const _id = uuidv4();

		const userAlreadyExists = await this.usersModule.findOne({
			where: {
				email: user.email,
			},
		});

		if (userAlreadyExists) {
			throw new ConflictException('Email already in use');
		}

		const companyExists = await this.companiesService.findOne(user.company_id);

		if (!companyExists) {
			throw new NotFoundException(
				`No company was found with the Id: ${user.company_id}`,
			);
		}

		const hashedPassword = await bcrypt.hash(user.password, 10);

		const createdUser = await this.usersModule.create({
			_id,
			...user,
			password: hashedPassword,
		});

		const plainUser = createdUser.get({ plain: true });

		delete plainUser.password;

		return plainUser;
	}

	async update(_id: string, user: UpdateUserDto): Promise<[number, Users[]]> {
		if (user.company_id) {
			const companyExists = await this.companiesService.findOne(
				user.company_id,
			);

			if (!companyExists) {
				throw new NotFoundException(
					`No company was found with the Id: ${user.company_id}`,
				);
			}
		}

		const userExists = await this.usersModule.findOne({
			where: {
				_id,
			},
		});

		if (!userExists) {
			throw new NotFoundException(`User with ID ${_id} not found`);
		}

		return this.usersModule.update(user, {
			where: {
				_id,
			},
			returning: true,
		});
	}

	async delete(_id: string): Promise<DestroyedResponse> {
		const userExists = await this.usersModule.findByPk(_id);

		if (!userExists) {
			throw new NotFoundException(`User with ID ${_id} not found`);
		}

		const hasDestroyed = await this.usersModule.destroy({
			where: {
				_id,
			},
		});

		return {
			_id,
			message: `User with id ${_id} successfully deleted`,
			success: hasDestroyed,
		};
	}
}
