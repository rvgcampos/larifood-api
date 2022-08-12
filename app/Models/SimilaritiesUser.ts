import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class SimilaritiesUser extends BaseModel {
  public tableName = 'similarities_users'

  @column({ isPrimary: true })
  public id: number

  @column()
  public userFromId: number

  @column()
  public userToId: number

  @column()
  public similarity: number

  // @belongsTo(() => Recipe, {
  //   foreignKey: 'recipeToId',
  //   localKey: 'id',
  // })
  // public recipeTo: BelongsTo<typeof Recipe>
}
