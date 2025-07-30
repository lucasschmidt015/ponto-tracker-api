import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Roles } from './roles.model';
import { CreateRoleDto } from './dtos/create-role.dto';
import { v4 as uuidv4 } from 'uuid';
import { ConflictException } from '@nestjs/common';
import { Op } from 'sequelize';
import DestroyedResponse from 'src/types/delete.response';

@Injectable()
export class RolesService {
	constructor(@InjectModel(Roles) private rolesModel: typeof Roles) {}

	async findOne(_id: string): Promise<Roles | null> {
		const role = await this.rolesModel.findOne({
			where: {
				_id,
			},
		});

		if (!role) {
			throw new NotFoundException(`Role with ID ${_id} not found`);
		}

		return role;
	}

	findAll(): Promise<Roles[]> {
		return this.rolesModel.findAll({});
	}

	async create(role: CreateRoleDto): Promise<Roles> {
		const _id = uuidv4();

		const roleAlreadyExists = await this.rolesModel.findOne({
			where: {
				name: role.name,
			},
		});

		if (roleAlreadyExists) {
			throw new ConflictException('This role already exists.');
		}

		return this.rolesModel.create({
			_id,
			...role,
		});
	}

	async update(_id: string, role: CreateRoleDto): Promise<[number, Roles[]]> {
		const roleAlreadyExists = await this.rolesModel.findOne({
			where: {
				[Op.and]: [{ name: role.name }, { _id: { [Op.not]: _id } }],
			},
		});

		if (roleAlreadyExists) {
			throw new ConflictException('This role already exists.');
		}

		return this.rolesModel.update(role, {
			where: {
				_id,
			},
			returning: true,
		});
	}

	async delete(_id: string): Promise<DestroyedResponse> {
		const roleExists = await this.rolesModel.findByPk(_id);

		if (!roleExists) {
			throw new NotFoundException(`No role was found with id ${_id}`);
		}

		const hasDestroyed = await this.rolesModel.destroy({
			where: {
				_id,
			},
		});
		return {
			_id,
			message: `Role with id ${_id} successfully deleted`,
			success: hasDestroyed,
		};
	}
}
