import { UserFactory } from './../../../database/factories/index'
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

  test('it should follow an user', async ({ client }) => {
    const newUser = await UserFactory.create()

    await client
      .post('/follow')
      .headers({ Authorization: `Bearer ${token}` })
      .json({ followingId: newUser.id })

    const register = await Database.query()
      .from('follows')
      .where('follower_id', user.id)
      .firstOrFail()

    console.log(register)
  })

  test('it should unfollow an user', async ({ client }) => {
    const newUser = await UserFactory.create()

    await client
      .post('/follow')
      .headers({ Authorization: `Bearer ${token}` })
      .json({ followingId: newUser.id })

    const register = await Database.query()
      .from('follows')
      .where('follower_id', user.id)
      .firstOrFail()

    console.log(register)

    await client
      .post('/unfollow')
      .headers({ Authorization: `Bearer ${token}` })
      .json({ followingId: newUser.id })

    const register2 = await Database.query().from('follows').where('follower_id', user.id).first()

    console.log(register2)
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
