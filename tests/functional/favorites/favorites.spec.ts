import {
  CategoryFactory,
  FavoritesFolderFactory,
  PrepareTimeUnitFactory,
  QtdUnitFactory,
  UserFactory,
} from './../../../database/factories/index'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { ApiClient } from '@japa/api-client'
import User from 'App/Models/User'

let token = ''
let user = {} as User
test.group('User', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should favorite an recipe', async ({ client }) => {
    const prepareTimeUnit1 = await PrepareTimeUnitFactory.create()
    const category1 = await CategoryFactory.create()
    const qtdUnit1 = await QtdUnitFactory.merge({ name: 'KG' }).create()

    const user1 = await UserFactory.create()

    const recipePayload1 = {
      name: 'Brownie',
      prepareTime: 2,
      userId: user1.id,
      prepareTimeUnitId: prepareTimeUnit1.id,
      categoryId: category1.id,
      ingredients: [
        { name: 'Leite', qtd: 1, qtd_units_id: qtdUnit1.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit1.id },
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
    const recipe1 = await client.post('/recipes').json(recipePayload1)

    const favorite = await client.post(`/favorite/${recipe1.body().recipe.id}`).headers({
      Authorization: `Bearer ${token}`,
    })

    console.log(JSON.stringify(favorite.body()), null, 4)
  })

  test('it should unFavorite an recipe', async ({ client }) => {
    const prepareTimeUnit1 = await PrepareTimeUnitFactory.create()
    const category1 = await CategoryFactory.create()
    const qtdUnit1 = await QtdUnitFactory.merge({ name: 'KG' }).create()

    const recipePayload1 = {
      name: 'Brownie',
      prepareTime: 2,
      userId: user.id,
      prepareTimeUnitId: prepareTimeUnit1.id,
      categoryId: category1.id,
      ingredients: [
        { name: 'Leite', qtd: 1, qtd_units_id: qtdUnit1.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit1.id },
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
    const recipe1 = await client.post('/recipes').json(recipePayload1)

    await client.post(`/favorite/${recipe1.body().recipe.id}`).headers({
      Authorization: `Bearer ${token}`,
    })

    const isFavorite1 = await Database.query().from('favorites').where({
      user_id: user.id,
      recipe_id: recipe1.body().recipe.id,
    })

    console.log(isFavorite1)

    await client.post(`/unfavorite/${recipe1.body().recipe.id}`).headers({
      Authorization: `Bearer ${token}`,
    })

    const isFavorite2 = await Database.query().from('favorites').where({
      user_id: user.id,
      recipe_id: recipe1.body().recipe.id,
    })
    console.log(isFavorite2)
  })

  test('it should list all favorites', async ({ client }) => {
    const prepareTimeUnit1 = await PrepareTimeUnitFactory.create()
    const category1 = await CategoryFactory.create()
    const qtdUnit1 = await QtdUnitFactory.merge({ name: 'KG' }).create()

    const recipePayload1 = {
      name: 'Brownie',
      prepareTime: 2,
      userId: user.id,
      prepareTimeUnitId: prepareTimeUnit1.id,
      categoryId: category1.id,
      ingredients: [
        { name: 'Leite', qtd: 1, qtd_units_id: qtdUnit1.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit1.id },
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
    const recipe1 = await client.post('/recipes').json(recipePayload1)
    const recipe2 = await client.post('/recipes').json({ ...recipePayload1, name: 'Brownie 2' })

    await client.post(`/favorite/${recipe1.body().recipe.id}`).headers({
      Authorization: `Bearer ${token}`,
    })
    await client.post(`/favorite/${recipe2.body().recipe.id}`).headers({
      Authorization: `Bearer ${token}`,
    })

    const response = await client.get(`/favorites`).headers({
      Authorization: `Bearer ${token}`,
    })

    console.log(JSON.stringify(response.body(), null, 4))
  })

  // POR PASTAS
  test('it should favorite an recipe in a folder', async ({ client }) => {
    const prepareTimeUnit1 = await PrepareTimeUnitFactory.create()
    const category1 = await CategoryFactory.create()
    const qtdUnit1 = await QtdUnitFactory.merge({ name: 'KG' }).create()
    const favoriteFolder = await FavoritesFolderFactory.merge({ userId: user.id }).create()

    // const user1 = await UserFactory.create()

    const recipePayload1 = {
      name: 'Brownie',
      prepareTime: 2,
      userId: user.id,
      prepareTimeUnitId: prepareTimeUnit1.id,
      categoryId: category1.id,
      isPrivate: false,
      ingredients: [
        { name: 'Leite', qtd: 1, qtd_units_id: qtdUnit1.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit1.id },
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
    const recipe1 = await client.post('/recipes').json(recipePayload1)

    const favorite = await client
      .post(`/favorite/${recipe1.body().recipe.id}`)
      .headers({
        Authorization: `Bearer ${token}`,
      })
      .json({ favoriteFolderId: favoriteFolder.id })

    console.log(JSON.stringify(favorite.body()), null, 4)
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
