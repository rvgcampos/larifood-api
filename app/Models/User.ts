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
} from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import LinkToken from './LinkToken'
import Recipe from './Recipe'
import UsersComment from './UsersComment'
import Favorite from './Favorite'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public imageUrl: string

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

  @manyToMany(() => UsersComment, {
    pivotTable: 'users_comments',
    localKey: 'id',
    pivotForeignKey: 'comment_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'user_id',
  })
  public skills: ManyToMany<typeof UsersComment>

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

  @computed()
  public get followersCount() {
    return this.$extras.followers_count
  }

  @computed()
  public get followingCount() {
    return this.$extras.following_count
  }

  @computed()
  public get isFollowing() {
    return this.$extras.isFollowing
  }
}
