import {
  CategoryFactory,
  PrepareTimeUnitFactory,
  QtdUnitFactory,
  UserFactory,
} from '../../../database/factories/index'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { ApiClient } from '@japa/api-client'
// import User from 'App/Models/User'

let token = ''
// let user = {} as User

test.group('Feed', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction('sqlite')
    return () => Database.rollbackGlobalTransaction('sqlite')
  })

  test('it should show recipes from followed users', async ({ client }) => {
    const prepareTimeUnit1 = await PrepareTimeUnitFactory.create()
    const prepareTimeUnit2 = await PrepareTimeUnitFactory.create()
    const category1 = await CategoryFactory.create()
    const category2 = await CategoryFactory.create()
    const qtdUnit1 = await QtdUnitFactory.merge({ name: 'KG' }).create()
    const qtdUnit2 = await QtdUnitFactory.merge({ name: 'L' }).create()

    const user1 = await UserFactory.create()
    const user2 = await UserFactory.create()

    // RECEITA DO USER 1
    const recipePayload1 = {
      name: 'Brownie',
      prepareTime: 2,
      userId: user1.id,
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

    const user1Recipe1 = await client.post('/recipes').json(recipePayload1)
    // await new Promise((r) => setTimeout(r, 2000))
    await client.post('/recipes').json({ ...recipePayload1, name: 'Brownie 2' })

    // RECEITA DO USER 2
    const recipePayload2 = {
      name: 'Frango',
      prepareTime: 2,
      userId: user2.id,
      prepareTimeUnitId: prepareTimeUnit2.id,
      categoryId: category2.id,
      isPrivate: false,
      ingredients: [
        { name: 'Leite', qtd: 1, qtd_units_id: qtdUnit2.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit2.id },
      ],
      prepareModes: [
        {
          description: 'Make this - 1',
        },
        {
          description: 'Make this - 2',
        },
      ],
    }
    // await new Promise((r) => setTimeout(r, 2000))

    await client.post('/recipes').json(recipePayload2)

    // USER LOGADO SEGUE USER 1
    await client
      .post('/follow')
      .headers({ Authorization: `Bearer ${token}` })
      .json({ followingId: user1.id })

    // USER LOGADO SEGUE USER 2
    await client
      .post('/follow')
      .headers({ Authorization: `Bearer ${token}` })
      .json({ followingId: user2.id })

    await client
      .post(`/recipes/${user1Recipe1.body().recipe.id}/like`)
      .headers({ Authorization: `Bearer ${token}` })

    const response = await client.get('/chronological-feed').headers({
      Authorization: `Bearer ${token}`,
    })

    // assert.equal(response.body().recipes.length, 3)

    console.log(JSON.stringify(response.body(), null, 5))
  })

  test('it should not show recipes from followed users because followed = 0', async ({
    assert,
    client,
  }) => {
    const prepareTimeUnit1 = await PrepareTimeUnitFactory.create()
    const prepareTimeUnit2 = await PrepareTimeUnitFactory.create()
    const category1 = await CategoryFactory.create()
    const category2 = await CategoryFactory.create()
    const qtdUnit1 = await QtdUnitFactory.merge({ name: 'KG' }).create()
    const qtdUnit2 = await QtdUnitFactory.merge({ name: 'L' }).create()

    const user1 = await UserFactory.create()
    const user2 = await UserFactory.create()

    // RECEITA DO USER 1
    const recipePayload1 = {
      name: 'Brownie',
      prepareTime: 2,
      userId: user1.id,
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

    await client.post('/recipes').json(recipePayload1)
    await new Promise((r) => setTimeout(r, 2000))
    await client.post('/recipes').json({ ...recipePayload1, name: 'Brownie 2' })

    // RECEITA DO USER 2
    const recipePayload2 = {
      name: 'Frango',
      prepareTime: 2,
      userId: user2.id,
      prepareTimeUnitId: prepareTimeUnit2.id,
      categoryId: category2.id,
      isPrivate: false,
      ingredients: [
        { name: 'Leite', qtd: 1, qtd_units_id: qtdUnit2.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit2.id },
      ],
      prepareModes: [
        {
          description: 'Make this - 1',
        },
        {
          description: 'Make this - 2',
        },
      ],
    }
    await new Promise((r) => setTimeout(r, 2000))

    await client.post('/recipes').json(recipePayload2)

    const response = await client.get('/chronological-feed').headers({
      Authorization: `Bearer ${token}`,
    })

    assert.equal(response.body().recipes.length, 0)

    // console.log(JSON.stringify(response.body(), null, 5))
  })

  group.setup(async () => {
    const client = new ApiClient()
    const plainPassword = 'test'
    const newUser = await UserFactory.merge({ password: plainPassword }).create()
    const response = await client
      .post('/sessions')
      .json({ email: newUser.email, password: plainPassword })
    token = response.body().token.token
    // user = newUser
  })

  group.teardown(async () => {
    const client = new ApiClient()
    await client.delete('/sessions').headers({ Authorization: `Bearer ${token}` })
  })
})
