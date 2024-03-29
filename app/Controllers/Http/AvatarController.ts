import Recipe from 'App/Models/Recipe'
import Database from '@ioc:Adonis/Lucid/Database'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UpdateValidator from 'App/Validators/UpdateValidator'
import fs from 'fs'
import Application from '@ioc:Adonis/Core/Application'
import AddPhotoRecipeValidator from 'App/Validators/AddPhotoRecipeValidator'

export default class AvatarController {
  public async update({ request, auth }: HttpContextContract) {
    const { file } = await request.validate(UpdateValidator)

    console.log('Entrou aquiiiiii')

    const user = auth.user!

    console.log(user.id)

    const searchPayload = {}
    const savePayload = {
      fileCategory: 'avatar' as any,
      fileName: `${user.username}-${new Date().getTime()}.${file.extname}`,
    }

    console.log(savePayload)

    const avatar = await user
      .related('avatar')
      .firstOrCreate({ ownerId: user.id, fileCategory: 'avatar' }, savePayload)

    console.log(avatar)

    await file.move(Application.tmpPath('uploads-file'), {
      name: avatar.fileName,
      overwrite: true,
    })

    return avatar
  }

  public async addPostPhoto({ request }: HttpContextContract) {
    const { file, idRecipe } = await request.validate(AddPhotoRecipeValidator)
    console.log(file)
    console.log(typeof file)
    console.log(idRecipe)
    console.log(typeof idRecipe)

    await Database.transaction()

    const recipe = await Recipe.findOrFail(Number(idRecipe))

    // const searchPayload = { ownerId: recipe.id, fileCategory: 'post' }
    const savePayload = {
      fileCategory: 'post' as any,
      fileName: `${idRecipe}-${new Date().getTime()}.${file.extname}`,
    }

    const avatar = await recipe
      .related('avatar')
      .firstOrCreate({ ownerId: recipe.id, fileCategory: 'post' }, savePayload)

    await file.move(Application.tmpPath('recipes-file'), {
      name: avatar.fileName,
      overwrite: true,
    })

    return avatar
  }

  public async destroy({ auth }: HttpContextContract) {
    await Database.transaction(async (trx) => {
      const user = auth.user!.useTransaction(trx)

      const avatar = await user
        .related('avatar')
        .query()
        .where({ fileCategory: 'avatar' })
        .firstOrFail()

      await avatar.delete()

      fs.unlinkSync(Application.tmpPath('uploads-file', avatar.fileName))
    })
  }
}
