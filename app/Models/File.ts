import { BaseModel, column, computed } from '@ioc:Adonis/Lucid/Orm'
import Env from '@ioc:Adonis/Core/Env'

export default class File extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public fileCategory: 'avatar' | 'post'

  @column()
  public ownerId: number

  @column()
  public fileName: string

  @computed()
  public get url(): string {
    return this.fileCategory === 'avatar'
      ? `${Env.get('APP_URL')}/uploads-file/${this.fileName}`
      : `${Env.get('APP_URL')}/recipes-file/${this.fileName}`
  }
}
