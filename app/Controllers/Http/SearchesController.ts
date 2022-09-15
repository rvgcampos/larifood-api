import Recipe from 'App/Models/Recipe'
import User from 'App/Models/User'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SearchesController {
  public async searchUsers({ request, response }: HttpContextContract) {
    const searchUser = request.param('searchString') as String

    const users = await User.query().whereLike('username', `%${searchUser.toLowerCase().trim()}%`)

    return response.created(users)
  }

  public async searchRecipes({ request, response }: HttpContextContract) {
    const searchRecipe = request.param('searchString') as String

    const recipes = await Recipe.query()
      .whereLike('name', `%${searchRecipe.toLowerCase().trim()}%`)
      .preload('avatar')
      .preload('user')

    return response.created(recipes)
  }

  public async searchRecipesByIngredients({ request, response }: HttpContextContract) {
    const { ingredients } = request.all()
    console.log(ingredients)

    let recipes = await Recipe.query().preload('ingredients', (query) => {
      query.whereIn('name', ingredients)
    })
    console.log(recipes.length)

    recipes = recipes.filter((value) => {
      return value.ingredients.length === Number(ingredients.length)
    })
    console.log(recipes.length)

    // const newRecipes: Recipe[] = []

    // for await (const recipe of recipes) {
    //   const newRecipe = await recipe.refresh()
    //   await newRecipe.load('ingredients')
    // }

    return response.created({ recipes })
  }

  public async searchRecipesByUser({ request, response }: HttpContextContract) {
    const searchRecipe = request.param('searchString') as String
    const userId = request.param('userId')

    const recipes = await Recipe.query()
      .whereLike('name', `%${searchRecipe.toLowerCase().trim()}%`)
      .andWhere('user_id', userId)
      .preload('ingredients')

    return response.created(recipes)
  }
}
