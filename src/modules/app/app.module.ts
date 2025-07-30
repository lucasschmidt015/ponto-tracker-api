//Packages
import configs from 'config';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScheduleModule } from '@nestjs/schedule';

//Modules
import { AuthModule } from '../auth/auth.module';
import { CompaniesModule } from '../companies/companies.module';
import { RolesModule } from '../roles/roles.module';
import { UserRolesModule } from '../user-roles/user-roles.module';
import { UsersModule } from '../users/users.module';
import { JwtConfigModule } from '../common/jwt/jwt.module';
import { WorkingDaysModule } from '../working-days/working-days.module';
import { EntriesModule } from '../entries/entries.module';
import { EntriesApprovalModule } from '../entries_approval/entries_approval.module';

//Models
import { Companies } from '../companies/companies.model';
import { Users } from '../users/users.model';
import { Roles } from '../roles/roles.model';
import { UserRoles } from '../user-roles/user-roles.model';
import { WorkingDays } from '../working-days/working-days.model';
import { Entries } from '../entries/entries.model';
import { EntriesApproval } from '../entries_approval/entries_approval.model';
import { AuthToken } from '../auth/auth-token.model';

//Guards
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../roles/roles.guard';

//Dependencies
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		SequelizeModule.forRoot({
			...configs.db,
			models: [
				Users,
				Companies,
				Roles,
				UserRoles,
				WorkingDays,
				Entries,
				EntriesApproval,
				AuthToken,
			],
		}),
		SequelizeModule.forFeature([AuthToken]),
		ScheduleModule.forRoot(),
		JwtConfigModule,
		AuthModule,
		UsersModule,
		RolesModule,
		UserRolesModule,
		CompaniesModule,
		WorkingDaysModule,
		EntriesModule,
		EntriesApprovalModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
	],
})
export class AppModule {}
