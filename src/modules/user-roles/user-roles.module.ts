import { Module } from '@nestjs/common';
import { UserRolesController } from './user-roles.controller';
import { UserRolesService } from './user-roles.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserRoles } from './user-roles.model';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';

@Module({
	imports: [SequelizeModule.forFeature([UserRoles]), UsersModule, RolesModule],
	controllers: [UserRolesController],
	providers: [UserRolesService],
})
export class UserRolesModule {}
