import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'

export default class UploadsController {
  public async show({ params, response }: HttpContextContract) {
    return response.download(Application.tmpPath('uploads', params.file))
  }

  public async showRecipe({ params, response }: HttpContextContract) {
    return response.download(Application.tmpPath('recipes', params.file))
  }
}
