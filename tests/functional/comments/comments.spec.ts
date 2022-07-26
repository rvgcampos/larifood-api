import {
  CommentFactory,
  IngredientFactory,
  PrepareModeFactory,
  QtdUnitFactory,
  RecipeFactory,
} from './../../../database/factories/index'
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

  test('it should create an comment', async ({ assert, client }) => {
    const prepareTimeUnit = await PrepareTimeUnitFactory.create()
    const category = await CategoryFactory.create()

    const recipe = await RecipeFactory.merge({
      prepareTimeUnitId: prepareTimeUnit.id,
      categoryId: category.id,
      userId: user.id,
    }).create()

    const payloadComment = {
      content: 'Receita legal',
      userId: user.id,
      recipeId: recipe.id,
    }

    const response = await client.post(`/recipes/${recipe.id}/comment`).json(payloadComment)
    console.log(response.body())
    response.assertStatus(201)

    assert.exists(response.body().comment, 'Comment undefined')
  })

  test('it should remove an comment', async ({ assert, client }) => {
    const prepareTimeUnit = await PrepareTimeUnitFactory.create()
    const category = await CategoryFactory.create()

    const recipe = await RecipeFactory.merge({
      prepareTimeUnitId: prepareTimeUnit.id,
      categoryId: category.id,
      userId: user.id,
    }).create()

    const commentFactory = await CommentFactory.merge({
      recipeId: recipe.id,
      userId: user.id,
    }).create()

    const payloadComment = {
      content: 'Receita legal 2',
      userId: user.id,
      recipeId: recipe.id,
    }

    const response = await client
      .put(`/recipes/${recipe.id}/comment/${commentFactory.id}`)
      .json(payloadComment)
    console.log(response.body())
    response.assertStatus(201)

    assert.exists(response.body().comment, 'Comment undefined')
  })

  test('it should like an comment', async ({ assert, client }) => {
    const prepareTimeUnit = await PrepareTimeUnitFactory.create()
    const category = await CategoryFactory.create()

    const recipe = await RecipeFactory.merge({
      prepareTimeUnitId: prepareTimeUnit.id,
      categoryId: category.id,
      userId: user.id,
    }).create()

    const commentFactory = await CommentFactory.merge({
      recipeId: recipe.id,
      userId: user.id,
    }).create()

    const response = await client
      .post(`/recipes/${recipe.id}/comment/${commentFactory.id}/like`)
      .headers({
        Authorization: `Bearer ${token}`,
      })
      .json({})
    console.log(response.body())

    const response2 = await client
      .post(`/recipes/${recipe.id}/comment/${commentFactory.id}/like`)
      .headers({
        Authorization: `Bearer ${token}`,
      })
      .json({})
    console.log(response2.body())

    assert.exists(response.body().userComment, 'userComment undefined')
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
