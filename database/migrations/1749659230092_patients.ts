import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'patients'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name')
      table.integer('cedula')
      table.integer('age')
      table.boolean('tetanos')
      table.string('tetanos_description')
      table.boolean('hepatitis_a')
      table.string('hepatitis_a_description')
      table.boolean('hepatitis_b')
      table.string('hepatitis_b_description')

      table.integer('alarma_id').unsigned().notNullable().references('id').inTable('alarms')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
