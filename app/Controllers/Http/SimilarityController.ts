import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Recipe from 'App/Models/Recipe'
import Similarity from 'App/Models/Similarity'

export default class SimilarityController {
  public async calculate({ request, response }: HttpContextContract) {
    const id = request.only(['id'])

    let similaridades = await Similarity.query()
      .where('recipe_from_id', Number(id))
      .orderBy('similarity', 'desc')
      .limit(20)
      .preload('recipeTo')

    similaridades = similaridades.sort(() => Math.random() - 0.5)

    response.created(similaridades)
  }
}
