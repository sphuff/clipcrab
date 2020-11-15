require('dotenv/config');
const path = require('path');

const dbUrl = process.env.NODE_ENV === 'production' ? `${process.env.DATABASE_URL}?ssl=true` : process.env.DATABASE_URL;

module.exports = {
  type: 'postgres',
  url: dbUrl,
  entities: [path.join(__dirname, './src/entity/**/*.ts')],
  migrations: [path.join(__dirname, './src/migration/**/*.ts')],
  cli: {
    migrationsDir: 'src/migration',
  },
};