import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Register from './Register'
import Payment from './Payment'

export default class Client extends BaseModel {
  @column({ isPrimary: true })
  public id: number
  @column()
  public name: string

  @column()
  public apellido: string

  @column()
  public email: string
  
  @column()
  public password: string

  @column()
  public user_id: string

  @hasMany(() => Register, {
    foreignKey: 'client_id'
  })
  public cliente: HasMany<typeof Register>

  
  @hasMany(() => Payment, {
    foreignKey: 'client_id'
  })
  public payment: HasMany<typeof Payment>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
