import Database from '@ioc:Adonis/Lucid/Database'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import User from 'App/Models/User'
import CreateUser from 'App/Validators/CreateUserValidator'
import UpdateUser from 'App/Validators/UpdateUserValidator'

export default class UsersController {
  public async show({ request, response, auth }: HttpContextContract) {
    const id = request.param('id')
    const loggedUser = await auth.authenticate()

    let user = await User.findOrFail(id)
    user = await User.query()
      .where('id', user.id)
      .preload('recipes', (query) => {
        query.preload('avatar').where('isPrivate', false)
      })
      .withAggregate('following', (query) => {
        query.count('*').as('following_count')
      })
      .withAggregate('followers', (query) => {
        query.count('*').as('follower_count')
      })
      .withAggregate('recipes', (query) => {
        query.count('*').as('recipes_count')
      })
      .firstOrFail()

    const isFollowing = await Database.from('follows')
      .where('follower_id', loggedUser.id)
      .andWhere('following_id', user.id)

    return response.ok({ user, isFollowing: isFollowing.length === 1 ? true : false })
  }

  public async store({ request, response }: HttpContextContract) {
    const userPayload = await request.validate(CreateUser) //request.all()
    const userByEmail = await User.findBy('email', userPayload.email)
    const userByUsername = await User.findBy('username', userPayload.username)

    if (userByEmail) throw new BadRequest('email already in use', 409)
    if (userByUsername) throw new BadRequest('username already in use', 409)

    const user = await User.create(userPayload)
    return response.created({ user })
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const { name, username, description, email } = await request.validate(UpdateUser)

    const id = request.param('id')
    const user = await User.findOrFail(id)

    // await bouncer.authorize('updateUser', user)

    user.name = name
    user.username = username
    user.description = description
    user.email = email

    await user.save()

    return response.ok({ user })
  }

  public async me({ response, auth }: HttpContextContract) {
    let user = await auth.authenticate()

    user = await User.query()
      .where('id', user.id)
      .preload('avatar')
      .preload('recipes', (query) => {
        query.preload('avatar')
      })
      .withAggregate('following', (query) => {
        query.count('*').as('following_count')
      })
      .withAggregate('followers', (query) => {
        query.count('*').as('follower_count')
      })
      .withAggregate('recipes', (query) => {
        query.count('*').as('recipes_count')
      })
      .firstOrFail()

    return response.ok({ user })
  }
}
