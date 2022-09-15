import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Ingredient from 'App/Models/Ingredient'
import PrepareMode from 'App/Models/PrepareMode'
import Recipe from 'App/Models/Recipe'
import CreateRecipeValidator from 'App/Validators/CreateRecipeValidator'
import Application from '@ioc:Adonis/Core/Application'

export default class RecipesController {
  public async show({ request, response }: HttpContextContract) {
    const recipeId = request.param('id')

    const recipe = await Recipe.query()
      .where('id', Number(recipeId))
      .preload('ingredients', (ingredientQuery) => {
        ingredientQuery.preload('qtdUnit')
      })
      .preload('prepareModes')
      .preload('comments')
      .preload('avatar')
      .firstOrFail()

    return response.ok(recipe)
  }

  public async store({ request, response }: HttpContextContract) {
    const data = await request.validate(CreateRecipeValidator)

    const trx = await Database.transaction()
    const recipe = await Recipe.create({
      name: data.name,
      prepareTime: data.prepareTime,
      isPrivate: data.isPrivate,
      userId: data.userId,
      prepareTimeUnitId: data.prepareTimeUnitId,
      categoryId: data.categoryId,
    })

    const ingredients: any = []
    const prepareModes: any = []
    for await (const ingredient of data.ingredients) {
      ingredients.push(await Ingredient.create({ ...ingredient, recipeId: recipe.id }))
    }
    for await (const prepareMode of data.prepareModes) {
      prepareModes.push(await PrepareMode.create({ ...prepareMode, recipeId: recipe.id }))
    }

    await trx.commit()

    return response.created({ recipe, ingredients, prepareModes })
  }

  public async update({ request, response, auth, params }: HttpContextContract) {
    const id = request.param('id')
    const payload = await request.all()
    const recipe = await Recipe.findOrFail(params.id)

    const recipePayload = {
      name: payload.name,
      prepareTime: payload.prepareTime,
      userId: payload.userId,
      prepareTimeUnitId: payload.prepareTimeUnitId,
      categoryId: payload.categoryId,
    }
    const trx = await Database.transaction()

    await recipe.merge(recipePayload).save()

    await Database.query().from('ingredients').where('recipe_id', id)
    await Database.query().from('prepare_modes').where('recipe_id', id)
    const ingredients: any = []
    const prepareModes: any = []
    for await (const ingredient of payload.ingredients) {
      ingredients.push(await Ingredient.create({ ...ingredient, recipeId: recipe.id }))
    }
    for await (const prepareMode of payload.prepareModes) {
      prepareModes.push(await PrepareMode.create({ ...prepareMode, recipeId: recipe.id }))
    }
    await trx.commit()

    return response.ok({ recipe, ingredients, prepareModes })
  }

  public async destroy({ response, auth, params }: HttpContextContract) {
    const recipe = await Recipe.findOrFail(params.id)

    await recipe.delete()

    return response.ok({})
  }
}
