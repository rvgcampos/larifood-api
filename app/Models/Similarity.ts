import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasOne,
  hasOne,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Recipe from './Recipe'

export default class Similarity extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public recipeFromId: number

  @column()
  public recipeToId: number

  @column()
  public similarity: number

  @belongsTo(() => Recipe, {
    foreignKey: 'recipeToId',
    localKey: 'id',
  })
  public recipeTo: BelongsTo<typeof Recipe>
}
