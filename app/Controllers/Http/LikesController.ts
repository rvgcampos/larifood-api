import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UsersLike from 'App/Models/UsersLike'

export default class LikesController {
  public async like({ request, response, auth }: HttpContextContract) {
    const recipeId = request.param('recipeId')
    const user = await auth.authenticate()
    let recipe = await UsersLike.firstOrCreate(
      {
        userId: user.id,
        recipeId: recipeId,
      },
      {
        userId: user.id,
        recipeId: recipeId,
      }
    )
    recipe.isLiked = Boolean(!recipe.isLiked)
    await recipe.save()

    recipe = await recipe.refresh()

    return response.created({ userLike: recipe })
  }
}
