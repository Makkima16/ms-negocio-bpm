/**
 * Config source: https://git.io/JesV9
 */

import Env from '@ioc:Adonis/Core/Env'
import type { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'
import { existsSync, readFileSync } from 'fs'

const sslEnabled = Env.get('MYSQL_SSL', 'false') === 'true'
const sslCertPath = Env.get('MYSQL_SSL_CERT', '')

const sslOptions =
  sslEnabled && sslCertPath && existsSync(sslCertPath)
    ? { ssl: { ca: readFileSync(sslCertPath, 'utf8') } }
    : {}

const databaseConfig: DatabaseConfig = {
  connection: Env.get('DB_CONNECTION', 'mysql'),

  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: Env.get('MYSQL_HOST', '127.0.0.1'),
        port: Number(Env.get('MYSQL_PORT', 3306)),
        user: Env.get('MYSQL_USER', 'root'),
        password: Env.get('MYSQL_PASSWORD', ''),
        database: Env.get('MYSQL_DB_NAME', 'modulos'),
        charset: 'utf8mb4',
        ...sslOptions,
      },
      migrations: {
        naturalSort: true,
      },
      healthCheck: false,
      debug: false,
    },
  },
}

export default databaseConfig
