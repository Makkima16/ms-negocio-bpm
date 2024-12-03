import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Exam from './Exam'

export default class Question extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public module_id: number

  @column()
  public text: string

  @column()
  public correct_choice: string

  @column()
  public choice_one: string

  @column()
  public choice_two: string

  @column()
  public choice_three: string
  
  @belongsTo(() => Exam,{
    foreignKey: 'module_id',
  })
  public modulo: BelongsTo<typeof Exam>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
