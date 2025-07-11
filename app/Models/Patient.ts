import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Alarm from './Alarm'

export default class Patient extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public alarma_id:number

  @column()
  public name:string

  @column()
  public age:number
  
  @column()
  public cedula:number

  @column()
  public tetanos:boolean

  @column()
  public hepatitis_a:boolean

  @column()
  public hepatitis_b:boolean

  @column()
  public tetanos_description:string

  @column()
  public hepatitis_a_description:string

  @column()
  public hepatitis_b_description:string
  
  @belongsTo(() => Alarm,{
    foreignKey: 'alarma_id',
  })
  public alarm: BelongsTo<typeof Alarm>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
