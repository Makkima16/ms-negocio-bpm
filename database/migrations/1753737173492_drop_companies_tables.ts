import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DropCompaniesTable extends BaseSchema {
  public async up () {
    this.schema.dropTable('companies')
  }

  public async down () {
    this.schema.createTable('companies', (table) => {
      table.increments('id')
      table.timestamps(true)
    })
  }
}
