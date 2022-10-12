import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Recipe from 'App/Models/Recipe'
import Similarity from 'App/Models/Similarity'

export default class SimilarityController {
  public async calculate({ request, response }: HttpContextContract) {
    const recipeId = request.param('recipeId')
    console.log(recipeId)

    let similaridades = await Similarity.query()
      .where('recipe_from_id', recipeId)
      .andWhereNot('recipe_to_id', recipeId)
      .orderBy('similarity', 'desc')
      .limit(6)
      .preload('recipeTo', (query) => {
        query.preload('avatar')
      })

    // similaridades = similaridades.sort(() => Math.random() - 0.5)

    response.created(similaridades)
  }
}
