import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string|null
  
  @column()
  public name: string|null
  
  @column()
  public ref: string
  
  @column()
  public client_id: number|null

  @column()
  public amount: number|null

  @column()
  public product: string|null

  @column()
  public state: string


  @belongsTo(() => Client,{
    foreignKey: 'client_id',
  })
  public cliente: BelongsTo<typeof Client>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
