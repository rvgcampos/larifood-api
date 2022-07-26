import Recipe from 'App/Models/Recipe'
import User from 'App/Models/User'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SearchesController {
  public async searchUsers({ request, response }: HttpContextContract) {
    const searchUser = request.param('searchString') as String
    console.log(searchUser)

    const users = await User.query().whereLike('username', `%${searchUser.toLowerCase().trim()}%`)

    return response.created(users)
  }

  public async searchRecipes({ request, response }: HttpContextContract) {
    const searchRecipe = request.param('searchString') as String

    const recipes = await Recipe.query().whereLike('name', `%${searchRecipe.toLowerCase().trim()}%`)

    return response.created(recipes)
  }

  public async searchRecipesByIngredients({ request, response }: HttpContextContract) {
    const ingredients = request.all()
  }
}
