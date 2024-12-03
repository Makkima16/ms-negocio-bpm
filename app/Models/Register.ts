import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Exam from './Exam'
import Client from './Client'

export default class Register extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public examen_id: number

  @column()
  public client_id: number

  @column()
  public answer1: string

  @column()
  public answer2: string

  @column()
  public answer3: string

  @column()
  public question1: string

  @column()
  public question2: string

  @column()
  public question3: string

  @column()
  public aprobacion: boolean

  @belongsTo(() => Exam,{
    foreignKey: 'examen_id',
  })
  public module_client_id: BelongsTo<typeof Exam>

  @belongsTo(() => Client,{
    foreignKey: 'client_id',
  })
  public cliente: BelongsTo<typeof Client>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
