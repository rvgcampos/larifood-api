import { QtdUnitFactory, RecipeFactory } from './../../../database/factories/index'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import User from 'App/Models/User'
import { ApiClient } from '@japa/api-client'
import { CategoryFactory, PrepareTimeUnitFactory, UserFactory } from 'Database/factories'

const util = require('util')
let token = ''
let user = {} as User

test.group('Recipes', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should get the prepare time unit', async ({ assert, client }) => {
    await PrepareTimeUnitFactory.merge({ name: 'min' }).create()
    await PrepareTimeUnitFactory.merge({ name: 'h' }).create()

    const response = await client.get('/prepare-time-unit')
    console.log(response.body())
  })

  test('it should get the categories', async ({ assert, client }) => {
    await CategoryFactory.merge({ name: 'Salgadas' }).create()
    await CategoryFactory.merge({ name: 'Doces' }).create()
    const qtdUnit = await QtdUnitFactory.create()

    const response = await client.get('/categories')
    console.log(response.body())
  })

  test('it should get the qtdUnits', async ({ assert, client }) => {
    await QtdUnitFactory.merge({ name: 'KG' }).create()
    await QtdUnitFactory.merge({ name: 'g' }).create()
    await QtdUnitFactory.merge({ name: 'xic' }).create()

    const response = await client.get('/qtd-unit')
    console.log(response.body())
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
