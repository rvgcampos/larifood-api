import Recipe from 'App/Models/Recipe'
import Database from '@ioc:Adonis/Lucid/Database'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UpdateValidator from 'App/Validators/UpdateValidator'
import fs from 'fs'
import Application from '@ioc:Adonis/Core/Application'
import AddPhotoRecipeValidator from 'App/Validators/AddPhotoRecipeValidator'

export default class AvatarController {
  public async update({ request, auth }: HttpContextContract) {
    const response = await Database.transaction(async (trx) => {
      const { file } = await request.validate(UpdateValidator)

      const user = auth.user!.useTransaction(trx)

      const searchPayload = {}
      const savePayload = {
        fileCategory: 'avatar' as any,
        fileName: `${user.username}-${new Date().getTime()}.${file.extname}`,
      }

      const avatar = await user.related('avatar').firstOrCreate(searchPayload, savePayload)

      await file.move(Application.tmpPath('uploads'), {
        name: avatar.fileName,
        overwrite: true,
      })

      return avatar
    })
    return response
  }

  public async addPostPhoto({ request, auth }: HttpContextContract) {
    const { file, idRecipe } = await request.validate(AddPhotoRecipeValidator)

    const trx = await Database.transaction()

    const recipe = await Recipe.findOrFail(Number(idRecipe))

    const searchPayload = {}
    const savePayload = {
      fileCategory: 'post' as any,
      fileName: `${idRecipe}-${new Date().getTime()}.${file.extname}`,
    }

    const avatar = await recipe.related('avatar').firstOrCreate(searchPayload, savePayload)

    await file.move(Application.tmpPath('recipes'), {
      name: avatar.fileName,
      overwrite: true,
    })

    return avatar
  }

  public async destroy({ request, response, auth }: HttpContextContract) {
    await Database.transaction(async (trx) => {
      const user = auth.user!.useTransaction(trx)

      const avatar = await user
        .related('avatar')
        .query()
        .where({ fileCategory: 'avatar' })
        .firstOrFail()

      await avatar.delete()

      fs.unlinkSync(Application.tmpPath('uploads', avatar.fileName))
    })
  }
}
