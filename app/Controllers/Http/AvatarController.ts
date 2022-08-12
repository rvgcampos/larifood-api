import Database from '@ioc:Adonis/Lucid/Database'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UpdateValidator from 'App/Validators/UpdateValidator'
import fs from 'fs'
import Application from '@ioc:Adonis/Core/Application'

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
