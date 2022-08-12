import Similarity from 'App/Models/Similarity'
import Recipe from 'App/Models/Recipe'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UsersLike from 'App/Models/UsersLike'

export default class FeedsController {
  public async index({ response, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    const recipes = await User.query()
      .where('id', user.id)
      .preload('following', (followingQuery) => {
        followingQuery.preload('recipes')
      })

    return response.ok({ recipes })
  }

  public async recomendativeFeed({ response, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    let likedRecipes = await UsersLike.query()
      .where('id', user.id)
      .andWhereNot('isLiked', true)
      .preload('recipe')
      .limit(50)

    likedRecipes = likedRecipes.sort(() => Math.random() - 0.5)

    let recipesLiked: Recipe[] = []
    likedRecipes.forEach(async (value) => {
      recipesLiked.push(await Recipe.query().where('id', value.recipe.id).firstOrFail())
    })

    // Baseada em Conteudo
    const recipe = recipesLiked[0]

    let similaridades = await Similarity.query()
      .where('recipe_from_id', recipe.id)
      .andWhereNot('recipe_to_id', recipe.id)
      .orderBy('similarity', 'desc')
      .limit(20)
      .preload('recipeTo')

    similaridades = similaridades.sort(() => Math.random() - 0.5)

    return response.created({})
  }
}
