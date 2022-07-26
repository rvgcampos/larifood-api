import { UserFactory } from './../../../database/factories/index'
import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Session', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should authenticate an user', async ({ assert, client }) => {
    const plainPassword = 'test'
    const { id, email } = await UserFactory.merge({ password: plainPassword }).create()
    const response = await client.post('/sessions').json({ email, password: plainPassword })
    response.assertStatus(201)

    assert.isDefined(response.body().user, 'User defined')
    assert.equal(response.body().user.id, id)
  })

  test('it should return an api token when session is created', async ({ assert, client }) => {
    const plainPassword = 'test'
    const { id, email } = await UserFactory.merge({ password: plainPassword }).create()
    const response = await client.post('/sessions').json({ email, password: plainPassword })
    response.assertStatus(201)

    assert.isDefined(response.body().token, 'Token defined')
    assert.equal(response.body().user.id, id)
  })

  test('it should return 400 when credentials are not provided', async ({ assert, client }) => {
    const response = await client.post('/sessions').json({})

    assert.isDefined(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 400)
  })

  test('it should return 400 when credentials are invalid', async ({ assert, client }) => {
    const { email } = await UserFactory.create()
    const response = await client.post('/sessions').json({ email, password: 'test' })

    assert.isDefined(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 400)
  })

  test('it should return 200 when user signs out', async ({ client }) => {
    const plainPassword = 'test'
    const { email } = await UserFactory.merge({ password: plainPassword }).create()
    const response = await client.post('/sessions').json({ email, password: plainPassword })
    response.assertStatus(201)

    const token = response.body().token

    const response2 = await client.delete('/sessions').headers({ Authorizaton: `Bearer ${token}` })
    response2.assertStatus(200)
  })

  test('it should revoke token when user signs out', async ({ assert, client }) => {
    const plainPassword = 'test'
    const { email } = await UserFactory.merge({ password: plainPassword }).create()
    const response = await client.post('/sessions').json({ email, password: plainPassword })
    response.assertStatus(201)

    const apiToken = response.body().token

    const response2 = await client
      .delete('/sessions')
      .headers({ Authorization: `Bearer ${apiToken.token}` })
    response2.assertStatus(200)

    const token = await Database.query().select('*').from('api_tokens')
    assert.isEmpty(token)
  })
})
