import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'modulos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('curso_tipo').nullable() // Campo para almacenar la URL de la imagen
      table.string('link').notNullable()
      table.text('titulo').notNullable()
      table.text('introduccion').notNullable()
      table.text('informacion').notNullable()
      table.text('conclusion').notNullable()
      table.string('imagen_url').nullable() // Campo para almacenar la URL de la imagen
      table.string('pdf_name').nullable(); // Campo para almacenar el nombre del archivo PDF



      
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
