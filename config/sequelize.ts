import configs from './';

const { db } = configs;

const config = {
	database: db.database,
	username: db.username,
	password: db.password,
	host: db.host,
	port: db.port,
	dialect: db.dialect,
};

export = config;
