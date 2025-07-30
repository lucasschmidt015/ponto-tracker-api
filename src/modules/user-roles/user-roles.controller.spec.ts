import { Test, TestingModule } from '@nestjs/testing';
import { UserRolesController } from './user-roles.controller';
import { UserRolesService } from './user-roles.service';
import { UserRoles } from './user-roles.model';
import { getModelToken } from '@nestjs/sequelize';
// import { CreateUserRoleDto } from './dtos/create-user-role.dto';

describe('UserRolesController', () => {
	let controller: UserRolesController;
	let service: UserRolesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserRolesController],
			providers: [
				{
					provide: getModelToken(UserRoles),
					useValue: {},
				},
				{
					provide: UserRolesService,
					useValue: {},
				},
			],
		}).compile();

		controller = module.get<UserRolesController>(UserRolesController);
		service = module.get<UserRolesService>(UserRolesService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
		expect(service).toBeDefined();
	});
});
