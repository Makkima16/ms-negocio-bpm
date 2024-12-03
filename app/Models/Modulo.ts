import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'

import Exam from './Exam'

export default class Modulo extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public link: string

  @column()
  public titulo: string

  @column()
  public introduccion: string

  @column()
  public informacion: string

  @column()
  public conclusion: string

  @column()
  public imagen_url: string; // Nuevo campo para la imagen


  @hasMany(() => Exam, {
    foreignKey: 'module_id'
  })
  public examen: HasMany<typeof Exam>


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
