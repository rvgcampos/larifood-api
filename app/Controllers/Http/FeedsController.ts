import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class FeedsController {
  public async index({ response, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    const recipes = await User.query()
      .where('id', user.id)
      .preload('following', (followingQuery) => {
        followingQuery.preload('recipes')
      })

    return response.ok({ recipes })
  }
}
