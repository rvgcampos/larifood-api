import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UnfollowsController {
  public async follow({ request, auth }: HttpContextContract) {
    const { followingId } = await request.only(['followingId'])

    const user = await User.findOrFail(followingId)

    await user.related('followers').attach([auth.user!.id])
  }

  public async unFollow({ request, auth }: HttpContextContract) {
    const { followingId } = await request.only(['followingId'])

    const user = await User.findOrFail(followingId)

    await user.related('followers').detach([auth.user!.id])
  }
}
