import SimilaritiesUser from 'App/Models/SimilaritiesUser'
import Similarity from 'App/Models/Similarity'
import Recipe from 'App/Models/Recipe'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UsersLike from 'App/Models/UsersLike'

export default class FeedsController {
  public async chronologicalFeed({ response, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    const following = await User.query().where('id', user.id).preload('following').firstOrFail()

    let followingList: any[] = []
    following.following.forEach((el) => {
      followingList.push(el.id)
    })

    const recipes = await Recipe.query()
      .whereIn('userId', followingList)
      .preload('user', (query) => {
        query.preload('avatar')
      })
      .preload('avatar')
      .preload('usersLikes', (query) => {
        query.where('userId', user.id)
      })
      .preload('usersFavorites', (query) => {
        query.where('userId', user.id)
      })
      .orderBy('createdAt', 'desc')

    return response.ok({ recipes })
  }

  public async recomendativeFeed({ response, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    let likedRecipes = await UsersLike.query()
      .where('userId', user.id)
      .andWhere('is_liked', true)
      .preload('recipe')
      .limit(50)
    // console.log(likedRecipes.length)

    // console.log(likedRecipes.length)
    likedRecipes = likedRecipes.sort(() => Math.random() - 0.5)

    let recipesLiked: Recipe[] = []
    // likedRecipes.forEach(async (value) => {
    //   recipesLiked.push(await Recipe.query().where('id', value.recipe.id).firstOrFail())
    // })

    for await (const recipeLike of likedRecipes) {
      recipesLiked.push(await Recipe.query().where('id', recipeLike.recipe.id).firstOrFail())
    }

    console.log(recipesLiked.length)

    // Baseada em Conteudo
    const recipe = recipesLiked[0]

    let similaridades = await Similarity.query()
      .where('recipe_from_id', recipe.id)
      .andWhereNot('recipe_to_id', recipe.id)
      .orderBy('similarity', 'desc')
      .limit(20)
      .preload('recipeTo', (query) => {
        query
          .preload('user', (query) => {
            query.preload('avatar')
          })
          .preload('avatar')
          .preload('usersLikes')
      })

    similaridades = similaridades.sort(() => Math.random() - 0.5)

    // Baseada em Usuário
    let similarUser = await SimilaritiesUser.query()
      .where('userFromId', user.id)
      // .andWhereNot('userToId', user.id)
      .orderBy('similarity', 'desc')
      .firstOrFail()

    let userRecipesLiked = await UsersLike.query()
      .where('userId', similarUser.userToId)
      .andWhere('is_liked', true)
      .preload('recipe', (query) => {
        query
          // .whereNot('userId', user.id)
          .preload('user', (query) => {
            query.preload('avatar')
          })
          .preload('avatar')
          .preload('usersLikes')
      })
      .limit(20)

    return response.created({ similaridades, userRecipesLiked })
  }
}
