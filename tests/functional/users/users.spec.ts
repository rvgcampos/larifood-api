import {
  CategoryFactory,
  PrepareTimeUnitFactory,
  QtdUnitFactory,
  UserFactory,
} from './../../../database/factories/index'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Hash from '@ioc:Adonis/Core/Hash'
import { ApiClient } from '@japa/api-client'
import User from 'App/Models/User'

let token = ''
let user = {} as User
test.group('User', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should create an user', async ({ assert, client }) => {
    const userPayload = {
      email: 'test@test.com',
      username: 'test',
      password: 'testee',
      imageUrl: 'https//images.com/image/1',
    }

    const response = await client.post('/users').json(userPayload)

    const { password, imageUrl, ...expected } = userPayload

    response.assertStatus(201)
    response.assertBodyContains({ user: expected })

    assert.exists(response.body().user, 'User undefined')
    assert.notExists(response.body().user.password, 'Password defined')
  })

  test('it should return 409 when email is already in use', async ({ assert, client }) => {
    const { email } = await UserFactory.create()
    const response = await client
      .post('/users')
      .json({ email, username: 'test', password: 'testee', imageUrl: 'https//images.com/image/1' })
    response.assertStatus(409)

    assert.include(response.body().message, 'email')
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 409)
  })

  test('it should return 409 when username is already in use', async ({ assert, client }) => {
    const { username } = await UserFactory.create()
    const response = await client.post('/users').json({
      username,
      email: 'test@test.com',
      password: 'testee',
      imageUrl: 'https//images.com/image/1',
    })
    response.assertStatus(409)

    assert.include(response.body().message, 'username')
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 409)
  })

  test('it should return 422 when required data is not provided', async ({ assert, client }) => {
    const response = await client.post('/users').json({})

    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  test('it should return 422 when providing an invalid email', async ({ assert, client }) => {
    const response = await client
      .post('/users')
      .json({ email: 'test@', password: 'testee', username: 'test' })

    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  test('it should return 422 when providing an invalid password', async ({ assert, client }) => {
    const response = await client
      .post('/users')
      .json({ email: 'test@', password: 'tes', username: 'test' })

    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  test('it should update an user', async ({ assert, client }) => {
    const email = 'test@test.com'
    const imageUrl = 'http://github.com/rvgcmapos'

    const response = await client
      .put(`/users/${user.id}`)
      .headers({ Authorization: `Bearer ${token}` })
      .json({ email, imageUrl, password: user.password })

    response.assertStatus(200)
    console.log(response.body())

    assert.exists(response.body().user, 'User undefined')
    assert.equal(response.body().user.email, email)
    assert.equal(response.body().user.image_url, imageUrl)
    assert.equal(response.body().user.id, user.id)
  })

  test('it should update the password of the user', async ({ assert, client }) => {
    const password = 'testee'

    const response = await client
      .put(`/users/${user.id}`)
      .headers({ Authorization: `Bearer ${token}` })

      .json({ email: user.email, imageUrl: user.imageUrl, password })

    response.assertStatus(200)
    console.log(response.body())

    assert.exists(response.body().user, 'User undefined')
    assert.equal(response.body().user.id, user.id)
    await user.refresh()
    assert.isTrue(await Hash.verify(user.password, password))
  })

  test('it should return 422 when required data is not provided', async ({ assert, client }) => {
    const { id } = await UserFactory.create()

    const response = await client
      .put(`/users/${id}`)
      .headers({ Authorization: `Bearer ${token}` })
      .json({})

    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  test('it should return 422 when providing an invalid email', async ({ assert, client }) => {
    const { id, password, imageUrl } = await UserFactory.create()

    const response = await client
      .put(`/users/${id}`)
      .headers({ Authorization: `Bearer ${token}` })

      .json({ password, imageUrl, email: 'test@' })

    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  test('it should return 422 when providing an invalid password', async ({ assert, client }) => {
    const { id, email, imageUrl } = await UserFactory.create()

    const response = await client
      .put(`/users/${id}`)
      .headers({ Authorization: `Bearer ${token}` })

      .json({ password: 'tes', imageUrl, email })

    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  test('it should return 422 when providing an invalid image url', async ({ assert, client }) => {
    const { id, password, email } = await UserFactory.create()

    const response = await client
      .put(`/users/${id}`)
      .headers({ Authorization: `Bearer ${token}` })
      .json({ password, imageUrl: 'test', email })

    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  // ROTA: ME
  test('it should return informations about user', async ({ assert, client }) => {
    const prepareTimeUnit = await PrepareTimeUnitFactory.create()
    const category = await CategoryFactory.create()
    const qtdUnit = await QtdUnitFactory.create()

    const recipePayload = {
      name: 'Brownie',
      prepareTime: 2,
      userId: user.id,
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
    await client.post('/recipes').json(recipePayload)

    const response = await client.get('/users').headers({
      Authorization: `Bearer ${token}`,
    })
    console.log(JSON.stringify(response.body(), null, 4))

    assert.isNotEmpty(response.body().user)
  })

  test('it should not return data when tokens is not passed', async ({ assert, client }) => {
    const response = await client.get('/users').headers({})

    assert.isUndefined(response.body().user, 'User is defined')
    assert.equal(response.body().status, 422)
    assert.equal(response.body().code, 'BAD_REQUEST')
  })

  test('it should not return data when tokens is invalid', async ({ assert, client }) => {
    const response = await client.get('/users').headers({
      Authorization: `Bearer 454353dsgdfg`,
    })

    assert.isUndefined(response.body().user, 'User is defined')
    assert.equal(response.body().status, 422)
    assert.equal(response.body().code, 'BAD_REQUEST')
  })

  // ROTA: INDEX
  test('it should return data about an certain user', async ({ assert, client }) => {
    const newUser = await UserFactory.create()

    const response = await client.get(`/users/${newUser.id}`).headers({
      Authorization: `Bearer ${token}`,
    })
    console.log(response.body())

    response.assertStatus(200)
    const body = response.body()
    assert.isDefined(body.user, 'User is not defined')
    assert.notEqual(user.id, body.user.id)
  })

  test('it should not return data about an certain user with invalid id', async ({
    assert,
    client,
  }) => {
    const response = await client.get(`/users/5`).headers({
      Authorization: `Bearer ${token}`,
    })

    assert.equal(response.body().status, 404)
    assert.equal(response.body().code, 'BAD_REQUEST')
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
