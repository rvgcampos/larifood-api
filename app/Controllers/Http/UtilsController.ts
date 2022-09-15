import QtdUnit from 'App/Models/QtdUnit'
import Category from 'App/Models/Category'
import PrepareTimeUnit from 'App/Models/PrepareTimeUnit'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Comment from 'App/Models/Comment'
import UsersComment from 'App/Models/UsersComment'

export default class UtilsController {
  public async getPrepareTimeUnit({ request, response }: HttpContextContract) {
    const prepareTimeUnits = await PrepareTimeUnit.all()

    return response.created(prepareTimeUnits)
  }

  public async getCategories({ request, response }: HttpContextContract) {
    const categories = await Category.all()

    return response.created(categories)
  }

  public async getQtdUnits({ request, response }: HttpContextContract) {
    const qtdUnits = await QtdUnit.all()

    return response.created(qtdUnits)
  }
}
