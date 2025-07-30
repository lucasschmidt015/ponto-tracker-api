import { AppConfig } from './types';

const prodConfig: AppConfig = {
	db: {
		dialect: 'postgres',
		database: process.env.DATABASE_NAME || 'ponto-tracker',
		username: process.env.DATABASE_USER || 'postgres',
		password: process.env.DATABASE_PASSWORD || '',
		host: process.env.DATABASE_HOST || 'localhost',
		port: process.env.DATABASE_PORT
			? parseInt(process.env.DATABASE_PORT, 10)
			: 5432,
		autoLoadModels: false,
		synchronize: false,
		logging: false,
	},
	auth: {
		jwt_secret: process.env.JWT_SECRET || 'super_secret_jwt',
	},
};

export default prodConfig;
