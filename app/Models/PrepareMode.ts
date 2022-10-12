import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class PrepareMode extends BaseModel {
  public table_name = 'prepare_modes'
  @column({ isPrimary: true })
  public id: number

  @column()
  public description: string

  @column()
  public recipeId: number

  @column()
  public order: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
