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
    // return () => Database.rollbackGlobalTransaction()
  })

  group.each.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('it should calculate similarity of recipes', async ({ client }) => {
    const prepareTimeUnit1 = await PrepareTimeUnitFactory.create()
    const category1 = await CategoryFactory.create()
    const qtdUnit1 = await QtdUnitFactory.merge({ name: 'KG' }).create()

    const recipePayload1 = {
      name: 'Brownie',
      prepareTime: 2,
      userId: user.id,
      isPrivate: true,
      prepareTimeUnitId: prepareTimeUnit1.id,
      categoryId: category1.id,
      ingredients: [
        { name: 'Leite de Cabra', qtd: 1, qtd_units_id: qtdUnit1.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit1.id },
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
    await client.post('/recipes').json(recipePayload1)
    await client.post('/recipes').json({
      ...recipePayload1,
      name: 'Brownie 2',
      ingredients: [
        { name: 'Ovo', qtd: 1, qtd_units_id: qtdUnit1.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit1.id },
      ],
    })
    await client.post('/recipes').json({ ...recipePayload1, name: 'Frango' })

    const response = await client.get('/similarity-recipes')
    // console.log(JSON.stringify(response.body(), null, 4))
  }).pin()

  test('it should calculate similarity of users', async ({ client }) => {
    const prepareTimeUnit1 = await PrepareTimeUnitFactory.create()
    const category1 = await CategoryFactory.create()
    const qtdUnit1 = await QtdUnitFactory.merge({ name: 'KG' }).create()

    const userFactory = await UserFactory.merge({ password: 'test' }).create()
    const userFactoryBody = await client
      .post('/sessions')
      .json({ email: userFactory.email, password: 'test' })

    const recipePayload1 = {
      name: 'Brownie',
      prepareTime: 2,
      userId: user.id,
      isPrivate: true,
      prepareTimeUnitId: prepareTimeUnit1.id,
      categoryId: category1.id,
      ingredients: [
        { name: 'Leite', qtd: 1, qtd_units_id: qtdUnit1.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit1.id },
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
    const recipe1 = await client.post('/recipes').json(recipePayload1)
    const recipe2 = await client.post('/recipes').json({
      ...recipePayload1,
      name: 'Brownie 2',
      ingredients: [
        { name: 'Ovo', qtd: 1, qtd_units_id: qtdUnit1.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit1.id },
      ],
    })
    const recipe3 = await client.post('/recipes').json({ ...recipePayload1, name: 'Frango' })

    // USUARIO LOGADO
    await client
      .post(`/recipes/${recipe1.body().recipe.id}/like`)
      .headers({ Authorization: `Bearer ${token}` })

    await client
      .post(`/recipes/${recipe2.body().recipe.id}/like`)
      .headers({ Authorization: `Bearer ${token}` })

    // USUARIO CRIADO
    await client
      .post(`/recipes/${recipe1.body().recipe.id}/like`)
      .headers({ Authorization: `Bearer ${userFactoryBody.body().token.token}` })
    await client
      .post(`/recipes/${recipe2.body().recipe.id}/like`)
      .headers({ Authorization: `Bearer ${userFactoryBody.body().token.token}` })
    await client
      .post(`/recipes/${recipe3.body().recipe.id}/like`)
      .headers({ Authorization: `Bearer ${userFactoryBody.body().token.token}` })

    const response = await client.get('/similarity-users')
    // const teste = await Database.from('users').select('*')
    // console.log(teste)

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

    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })
})
