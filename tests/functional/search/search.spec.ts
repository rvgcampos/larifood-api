import {
  CategoryFactory,
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

  test('it should return a list of recipes', async ({ client }) => {
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
    await client.post('/recipes').json(recipePayload1)
    await client.post('/recipes').json({ ...recipePayload1, name: 'Brownie 2' })
    await client.post('/recipes').json({ ...recipePayload1, name: 'Frango' })

    const response = await client.get('/search-recipe/brownie')
    console.log(JSON.stringify(response.body(), null, 4))
  })

  test('it should return a list of users', async ({ client }) => {
    const user1 = await UserFactory.create()
    const user2 = await UserFactory.create()
    const user3 = await UserFactory.create()

    const response = await client.get(`/search-user/${user1.username}`)
    console.log(JSON.stringify(response.body(), null, 4))
  }).pin()

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
