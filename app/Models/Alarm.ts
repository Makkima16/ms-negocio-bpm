import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'
import Patient from './Patient'

export default class Alarm extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public client_id: number

  @column()
  public subject: string

  @column()
  public content: string

  @column.dateTime()
  public date: DateTime

  @column()
  public servidor: string

  @belongsTo(() => Client,{
    foreignKey: 'client_id',
  })
  public cliente: BelongsTo<typeof Client>

  @hasMany(() => Patient, {
      foreignKey: 'alarma_id'
    })
    public patient: HasMany<typeof Patient>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
