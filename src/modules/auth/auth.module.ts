import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthToken } from './auth-token.model';

@Module({
	imports: [UsersModule, SequelizeModule.forFeature([AuthToken])],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule {}
