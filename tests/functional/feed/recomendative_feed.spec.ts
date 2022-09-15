import {
  CategoryFactory,
  PrepareTimeUnitFactory,
  QtdUnitFactory,
  UserFactory,
} from '../../../database/factories/index'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { ApiClient } from '@japa/api-client'
import User from 'App/Models/User'

let token = ''
let user = {} as User

test.group('Feed', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction('sqlite')
    return () => Database.rollbackGlobalTransaction('sqlite')
  })

  test('it should show recipes from the recommendative users', async ({ assert, client }) => {
    const prepareTimeUnit1 = await PrepareTimeUnitFactory.create()
    const prepareTimeUnit2 = await PrepareTimeUnitFactory.create()
    const category1 = await CategoryFactory.create()
    const category2 = await CategoryFactory.create()
    const qtdUnit1 = await QtdUnitFactory.merge({ name: 'KG' }).create()
    const qtdUnit2 = await QtdUnitFactory.merge({ name: 'L' }).create()

    const plainPassword = 'test'
    const user1 = await UserFactory.merge({ password: plainPassword }).create()
    const user2 = await UserFactory.merge({ password: plainPassword }).create()

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
    const user1Recipe2 = await client.post('/recipes').json({
      ...recipePayload1,
      name: 'Bronie 2',
      ingredients: [
        { name: 'Leite', qtd: 1, qtd_units_id: qtdUnit1.id },
        { name: 'Manteiga', qtd: 1, qtd_units_id: qtdUnit1.id },
        { name: 'Ovos', qtd: 1, qtd_units_id: qtdUnit1.id },
      ],
    })
    await client.post('/recipes').json({
      ...recipePayload1,
      ingredients: [
        { name: 'Acucar', qtd: 1, qtd_units_id: qtdUnit1.id },
        { name: 'Chocolate', qtd: 1, qtd_units_id: qtdUnit1.id },
      ],
    })

    // // USUARIO 1 LOGOU E GOSTOU
    // const responseUser1 = await client
    //   .post('/sessions')
    //   .json({ email: user1.email, password: plainPassword })

    // await client
    //   .post(`/recipes/${user1Recipe2.body().recipe.id}/like`)
    //   .headers({ Authorization: `Bearer ${responseUser1.body().token.token}` })

    // USUARIO LOGADO LOGADO GOSTOU

    await client
      .post(`/recipes/${user1Recipe2.body().recipe.id}/like`)
      .headers({ Authorization: `Bearer ${token}` })

    // RECEITA DO USER 2
    const recipePayload2 = {
      name: 'Frango',
      prepareTime: 2,
      userId: user2.id,
      prepareTimeUnitId: prepareTimeUnit2.id,
      categoryId: category2.id,
      isPrivate: false,
      ingredients: [
        { name: 'Arroz', qtd: 1, qtd_units_id: qtdUnit2.id },
        { name: 'Feijao', qtd: 1, qtd_units_id: qtdUnit2.id },
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

    await client.post('/recipes').json(recipePayload2)
    const user2Recipe2 = await client.post('/recipes').json({
      ...recipePayload2,
      ingredients: [
        { name: 'Banana', qtd: 1, qtd_units_id: qtdUnit2.id },
        { name: 'Aveia', qtd: 1, qtd_units_id: qtdUnit2.id },
      ],
    })

    // USUARIO LOGADO GOSTOU
    await client
      .post(`/recipes/${user2Recipe2.body().recipe.id}/like`)
      .headers({ Authorization: `Bearer ${token}` })
    const r = await Database.from('users_likes').where('user_id', user.id)
    console.log(r)

    // CALCULANDO SIMILARIDADES
    // await client.get('/similarity-users')
    await client.get('/similarity-recipes')

    const response = await client.get('/recomendative-feed').headers({
      Authorization: `Bearer ${token}`,
    })

    console.log(JSON.stringify(response.body(), null, 5))
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
