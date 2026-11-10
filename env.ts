/*
|--------------------------------------------------------------------------
| Validating Environment Variables
|--------------------------------------------------------------------------
*/

import Env from '@ioc:Adonis/Core/Env'

export default Env.rules({
  HOST: Env.schema.string({ format: 'host' }),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  APP_NAME: Env.schema.string(),
  DRIVE_DISK: Env.schema.enum(['local'] as const),
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),

  DB_CONNECTION: Env.schema.enum(['mysql'] as const),
  MYSQL_HOST: Env.schema.string(),
  MYSQL_PORT: Env.schema.number(),
  MYSQL_USER: Env.schema.string(),
  MYSQL_PASSWORD: Env.schema.string.optional(),
  MYSQL_DB_NAME: Env.schema.string(),

  // Shared with ms-security to verify the JWTs it issues.
  JWT_SECRET: Env.schema.string.optional(),
  CORS_ORIGIN: Env.schema.string.optional(),
  MS_CORREOS: Env.schema.string.optional(),
  ALARM_SECRET_TOKEN: Env.schema.string.optional(),

  // ePayco webhook signature verification.
  EPAYCO_CUSTOMER_ID: Env.schema.string.optional(),
  EPAYCO_P_KEY: Env.schema.string.optional(),
})
