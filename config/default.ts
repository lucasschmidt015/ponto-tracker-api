export default {
	db: {
		dialect: 'postgres' as const,
		database: '',
		username: '',
		password: '',
		host: '',
		port: 5432,
		autoLoadModels: false,
		synchronize: false,
		logging: false,
	},
	auth: {
		jwt_secret: process.env.JWT_SECRET || 'super_secret_jwt',
	},
};
