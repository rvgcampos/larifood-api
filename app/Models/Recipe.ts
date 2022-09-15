import Comment from 'App/Models/Comment'
import PrepareMode from 'App/Models/PrepareMode'
import Favorite from 'App/Models/Favorite'
import UsersLike from 'App/Models/UsersLike'
import Ingredient from 'App/Models/Ingredient'
import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  HasOne,
  hasOne,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import File from './File'

export default class Recipe extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public isPrivate: boolean

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

  @hasOne(() => File, {
    foreignKey: 'ownerId',
    onQuery: (query) => query.where({ fileCategory: 'post' }),
  })
  public avatar: HasOne<typeof File>

  @hasMany(() => PrepareMode, {
    foreignKey: 'recipeId',
    localKey: 'id',
  })
  public prepareModes: HasMany<typeof PrepareMode>

  @hasMany(() => Ingredient, {
    foreignKey: 'recipeId',
    localKey: 'id',
  })
  public ingredients: HasMany<typeof Ingredient>

  @hasMany(() => UsersLike, {
    foreignKey: 'recipeId',
    localKey: 'id',
  })
  public usersLikes: HasMany<typeof UsersLike>

  @hasMany(() => Favorite, {
    foreignKey: 'recipeId',
    localKey: 'id',
  })
  public usersFavorites: HasMany<typeof Favorite>

  @hasMany(() => Comment, {
    foreignKey: 'recipeId',
    localKey: 'id',
  })
  public comments: HasMany<typeof Comment>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
