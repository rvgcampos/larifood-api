import { QtdUnitFactory, RecipeFactory } from './../../../database/factories/index'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import User from 'App/Models/User'
import { ApiClient } from '@japa/api-client'
import { CategoryFactory, PrepareTimeUnitFactory, UserFactory } from 'Database/factories'

let token = ''
let user = {} as User

test.group('Recipes', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should create an recipe', async ({ assert, client }) => {
    const prepareTimeUnit = await PrepareTimeUnitFactory.create()
    const category = await CategoryFactory.create()
    const qtdUnit = await QtdUnitFactory.create()

    const recipePayload = {
      name: 'Brownie',
      prepareTime: 2,
      userId: 1,
      prepareTimeUnitId: prepareTimeUnit.id,
      categoryId: category.id,
      ingredients: [
        { name: 'Leite', qtd: '1', qtd_units_id: qtdUnit.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit.id },
      ],
      prepareModes: [
        {
          description: 'Faça isso - 1',
        },
        {
          description: 'Faça isso - 2',
        },
      ],
    }

    const response = await client.post('/recipes').json(recipePayload)
    console.log(response.body())
    response.assertStatus(201)

    assert.exists(response.body().recipe, 'Recipe undefined')
    assert.exists(response.body().ingredients, 'Ingredients undefined')
    assert.exists(response.body().prepareModes, 'PrepareModes undefined')
  })

  test('it should return 422 when required data is not provided', async ({ assert, client }) => {
    const prepareTimeUnit = await PrepareTimeUnitFactory.create()
    const category = await CategoryFactory.create()
    const qtdUnit = await QtdUnitFactory.create()

    const recipePayload = {
      name: 'Brownie',
      prepareTime: 2,
      userId: 1,
      prepareTimeUnitId: prepareTimeUnit.id,
      categoryId: category.id,
      ingredients: [
        { name: 'Leite', qtd_units_id: qtdUnit.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit.id },
      ],
      prepareModes: [
        {
          description: 'Faça isso - 1',
        },
        {
          description: 'Faça isso - 2',
        },
      ],
    }
    const response = await client.post('/recipes').json(recipePayload)
    console.log(response.body())
    assert.equal(response.body().status, 422)
    assert.equal(response.body().code, 'BAD_REQUEST')
  })

  test('it should update a recipe', async ({ client }) => {
    const prepareTimeUnit = await PrepareTimeUnitFactory.create()
    const category = await CategoryFactory.create()
    const qtdUnit = await QtdUnitFactory.create()

    const recipePayload = {
      name: 'Brownie 2',
      prepareTime: 2,
      userId: 1,
      isPrivate: false,
      prepareTimeUnitId: prepareTimeUnit.id,
      categoryId: category.id,
      ingredients: [
        { name: 'Leite', qtd: 1, qtd_units_id: qtdUnit.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit.id },
      ],
      prepareModes: [
        {
          description: 'Faça isso - 1',
          order: 1,
        },
        {
          description: 'Faça isso - 2',
          order: 2,
        },
      ],
    }
    const response = await client.post('/recipes').json(recipePayload)
    console.log(JSON.stringify(response.body()), null, 5)

    const responseUpdate = await client.put(`/recipes/${response.body().recipe.id}`).json({
      ...recipePayload,
      ingredients: [
        { name: 'LEITE', qtd: 1, qtd_units_id: qtdUnit.id },
        { name: 'MANTEIGA', qtd: 1, qtd_units_id: qtdUnit.id },
      ],
    })

    console.log(JSON.stringify(responseUpdate.body()), null, 5)
  })

  test('it should return 404 when providing an unexisting recipe for update', async ({
    assert,
    client,
  }) => {
    const prepareTimeUnit = await PrepareTimeUnitFactory.create()
    const category = await CategoryFactory.create()
    const qtdUnit = await QtdUnitFactory.create()

    await RecipeFactory.merge({
      prepareTimeUnitId: prepareTimeUnit.id,
      categoryId: category.id,
      userId: user.id,
    }).create()

    const recipePayload = {
      name: 'Brownie 2',
      prepareTime: 2,
      userId: 1,
      prepareTimeUnitId: prepareTimeUnit.id,
      categoryId: category.id,
      ingredients: [
        { name: 'Leite', qtd: 1, qtd_units_id: qtdUnit.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit.id },
      ],
      prepareModes: [
        {
          description: 'Faça isso - 1',
        },
        {
          description: 'Faça isso - 2',
        },
      ],
    }

    const response = await client.put(`/recipes/4544`).json(recipePayload)
    assert.equal(response.body().status, 404)
    assert.equal(response.body().code, 'BAD_REQUEST')
  })

  test('it should remove a recipe', async ({ assert, client }) => {
    const prepareTimeUnit = await PrepareTimeUnitFactory.create()
    const category = await CategoryFactory.create()

    const recipe = await RecipeFactory.merge({
      prepareTimeUnitId: prepareTimeUnit.id,
      categoryId: category.id,
      userId: user.id,
    }).create()

    const response = await client.delete(`/recipes/${recipe.id}`).json({})
    const emptyRecipe = await Database.query().from('recipes').where('user_id', user.id)
    response.assertStatus(200)
    assert.isEmpty(emptyRecipe)
  })

  // RecipesController.show
  test('it should show a recipe', async ({ client }) => {
    const prepareTimeUnit = await PrepareTimeUnitFactory.create()
    const category = await CategoryFactory.create()
    const qtdUnit = await QtdUnitFactory.create()

    const recipePayload = {
      name: 'Brownie',
      prepareTime: 2,
      userId: 1,
      isPrivate: false,
      prepareTimeUnitId: prepareTimeUnit.id,
      categoryId: category.id,
      ingredients: [
        { name: 'Leite', qtd: 1, qtd_units_id: qtdUnit.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit.id },
      ],
      prepareModes: [
        {
          description: 'Faça isso - 1',
        },
        {
          description: 'Faça isso - 2',
        },
      ],
    }
    await client.post('/recipes').json(recipePayload)

    const recipePayload2 = {
      name: 'Brownie Diferenciado',
      prepareTime: 2,
      userId: 1,
      prepareTimeUnitId: prepareTimeUnit.id,
      categoryId: category.id,
      isPrivate: false,
      ingredients: [
        { name: 'Leite', qtd: 1, qtd_units_id: qtdUnit.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit.id },
      ],
      prepareModes: [
        {
          description: 'Faça isso - 1',
        },
        {
          description: 'Faça isso - 2',
        },
      ],
    }
    const recipe2 = await client.post('/recipes').json(recipePayload2)

    // console.log(util.inspect(recipe2.body(), { showHidden: false, depth: null, colors: true }))
    const response = await client.get(`/recipes/${recipe2.body().recipe.id}`)
    console.log(JSON.stringify(response.body(), null, 4))
  })

  group.setup(async () => {
    const client = new ApiClient()
    const plainPassword = 'test'
    const newUser = await UserFactory.merge({ password: plainPassword }).create()
    const response = await client
      .post('/sessions')
      .json({ email: newUser.email, password: plainPassword })
    token = response.body().token.token
    user = newUser
  })

  group.teardown(async () => {
    const client = new ApiClient()
    await client.delete('/sessions').headers({ Authorization: `Bearer ${token}` })
  })
})
