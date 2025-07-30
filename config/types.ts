export interface AppConfig {
	db: {
		dialect: 'postgres';
		database: string;
		username: string;
		password: string;
		host: string;
		port: number;
		autoLoadModels: boolean;
		synchronize: boolean;
		logging: boolean;
	};
	auth: {
		jwt_secret: string;
	};
}
