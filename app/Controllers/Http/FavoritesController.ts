import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Favorite from 'App/Models/Favorite'

export default class FavoritesController {
  public async favorite({ request, response, auth }: HttpContextContract) {
    const recipeId = request.param('recipeId')
    const user = await auth.authenticate()
    const favorite = await Favorite.firstOrCreate(
      { recipeId, userId: user.id },
      { recipeId, userId: user.id }
    )
    // const favorite = await Favorite.create({ recipeId, userId: user.id })
    return response.created(favorite)

    // console.log(favoriteFolderId)

    // const { favoriteFolderId } = request.only(['favoriteFolderId'])
    // if (favoriteFolderId === null) {
    // } else {
    //   const favorite = await Favorite.create({
    //     recipeId,
    //     userId: user.id,
    //     favoriteFolderId: favoriteFolderId,
    //   })
    //   return response.created(favorite)
    // }
  }

  public async unFavorite({ request, response, auth }: HttpContextContract) {
    const recipeId = request.param('recipeId')
    const user = await auth.authenticate()

    const favorite = await Favorite.query()
      .where({ recipeId: recipeId, userId: user.id })
      .firstOrFail()

    await favorite.delete()

    return response.created(favorite)
  }

  public async index({ response, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    const favorite = await Favorite.query()
      .where({ userId: user.id })
      .preload('recipe', (query) => {
        query.preload('avatar')
      })

    return response.created(favorite)
  }
}
