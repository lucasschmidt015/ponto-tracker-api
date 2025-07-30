import configs from './';

const { db } = configs;

const config = {
	database: db.database,
	username: db.username,
	password: db.password,
	host: db.host,
	port: db.port,
	dialect: db.dialect,
	migrationStorage: 'sequelize',
	migrationStorageTableName: 'sequelize_meta',
	migrationStorageTableSchema: undefined,
	seederStorage: 'sequelize',
	seederStorageTableName: 'sequelize_data',
	seederStorageTableSchema: undefined,
	'migrations-path': './migrations',
	'seeders-path': './src/seeders',
	'models-path': './src/modules',
};

export = config;
