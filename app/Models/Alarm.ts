import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'

export default class Alarm extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public client_id: number

  @column()
  public subject: string

  @column()
  public content: string

  @column()
  public date: DateTime

  @belongsTo(() => Client,{
    foreignKey: 'client_id',
  })
  public cliente: BelongsTo<typeof Client>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
