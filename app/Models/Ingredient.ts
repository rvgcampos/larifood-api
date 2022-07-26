import Recipe from 'App/Models/Recipe'
import QtdUnit from 'App/Models/QtdUnit'
import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'

export default class Ingredient extends BaseModel {
  public tableName = 'ingredients'

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public qtd: number

  @column()
  public qtdUnitsId: number

  @column()
  public recipeId: number

  @hasOne(() => QtdUnit, {
    foreignKey: 'id',
    localKey: 'qtdUnitsId',
  })
  public qtdUnit: HasOne<typeof QtdUnit>

  @belongsTo(() => Recipe, {
    foreignKey: 'recipeId',
    localKey: 'id',
  })
  public recipe: BelongsTo<typeof Recipe>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
