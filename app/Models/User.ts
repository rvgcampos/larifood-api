import UsersLike from 'App/Models/UsersLike'
import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeSave,
  column,
  HasMany,
  hasMany,
  manyToMany,
  ManyToMany,
  computed,
  hasOne,
  HasOne,
} from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import LinkToken from './LinkToken'
import Recipe from './Recipe'
import UsersComment from './UsersComment'
import Favorite from './Favorite'
import File from './File'

export default class User extends BaseModel {
  public tableName = 'users'
  public serializeExtras = true

  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public email: string

  @column()
  public name: string

  @column()
  public description: string

  @column({ serializeAs: null })
  public password: string

  @hasMany(() => LinkToken, {
    foreignKey: 'userId',
  })
  public tokens: HasMany<typeof LinkToken>

  // seguidores
  @manyToMany(() => User, {
    pivotTable: 'follows',
    pivotForeignKey: 'following_id',
    pivotRelatedForeignKey: 'follower_id',
  })
  public followers: ManyToMany<typeof User>

  // seguindo
  @manyToMany(() => User, {
    pivotTable: 'follows',
    pivotRelatedForeignKey: 'following_id',
    pivotForeignKey: 'follower_id',
  })
  public following: ManyToMany<typeof User>

  @hasMany(() => Recipe, {
    foreignKey: 'userId',
    localKey: 'id',
  })
  public recipes: HasMany<typeof Recipe>

  @hasMany(() => Favorite, {
    foreignKey: 'userId',
    localKey: 'id',
  })
  public favorites: HasMany<typeof Favorite>

  @hasOne(() => File, {
    foreignKey: 'ownerId',
    onQuery: (query) => query.where({ fileCategory: 'avatar' }),
  })
  public avatar: HasOne<typeof File>

  @manyToMany(() => UsersComment, {
    pivotTable: 'users_comments',
    localKey: 'id',
    pivotForeignKey: 'comment_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'user_id',
  })
  public comments: ManyToMany<typeof UsersComment>

  @manyToMany(() => Recipe, {
    pivotTable: 'users_likes',
    localKey: 'id',
    pivotForeignKey: 'user_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'recipe_id',
  })
  public likes: ManyToMany<typeof Recipe>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
