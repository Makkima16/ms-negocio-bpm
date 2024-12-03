import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Register from './Register'
import Modulo from './Modulo'
import Question from './Question'

export default class Exam extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  public module_id: number

  @column()
  public information: string


  @hasMany(() => Register, {
    foreignKey: 'examen_id'
  })
  public register_module: HasMany<typeof Register>

  @hasMany(() => Question, {
    foreignKey: 'module_id'
  })
  public question: HasMany<typeof Question>

  @belongsTo(() => Modulo,{
    foreignKey: 'module_id',
  })
  public modulo: BelongsTo<typeof Modulo>
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
