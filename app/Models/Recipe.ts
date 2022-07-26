import Ingredient from 'App/Models/Ingredient'
import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Recipe extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public prepareTimeUnitId: number

  @column()
  public categoryId: number

  @column()
  public name: string

  @column()
  public prepareTime: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => Ingredient, {
    foreignKey: 'recipeId',
    localKey: 'id',
  })
  public ingredients: HasMany<typeof Ingredient>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
