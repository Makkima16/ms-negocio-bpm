import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'registers'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('examen_id').unsigned().nullable().references('id').inTable('exams')
      table.integer('client_id').unsigned().nullable().references('id').inTable('clients')

      table.string('question1')
      table.string('answer1')
      table.string('question2')
      table.string('answer2')
      table.string('question3')
      table.string('answer3')
      table.boolean('aprobacion').defaultTo(false);  // Agregar esta columna si es necesario

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
