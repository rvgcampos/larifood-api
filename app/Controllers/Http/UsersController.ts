import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import User from 'App/Models/User'
import CreateUser from 'App/Validators/CreateUserValidator'
import UpdateUser from 'App/Validators/UpdateUserValidator'

export default class UsersController {
  public async show({ request, response }: HttpContextContract) {
    const id = request.param('id')
    const user = await User.findOrFail(id)
    await user.load('recipes')
    return response.ok({ user })
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
    const { email, password, imageUrl } = await request.validate(UpdateUser)

    const id = request.param('id')
    const user = await User.findOrFail(id)

    await bouncer.authorize('updateUser', user)

    user.email = email
    user.password = password
    if (imageUrl) user.imageUrl = imageUrl

    await user.save()

    return response.ok({ user })
  }

  public async me({ response, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    await user.load('recipes')
    return response.ok({ user })
  }
}
