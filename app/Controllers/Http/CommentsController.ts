import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Comment from 'App/Models/Comment'
import UsersComment from 'App/Models/UsersComment'

export default class CommentsController {
  public async store({ request, response }: HttpContextContract) {
    const payload = await request.all()
    const comment = await Comment.create(payload)

    return response.created({ comment })
  }

  public async update({ request, response, params }: HttpContextContract) {
    const payload = await request.all()
    const comment = await Comment.findOrFail(params.commentId)

    const updatedComment = await comment.merge(payload)

    return response.created({ comment: updatedComment })
  }

  public async destroy({ response, params }: HttpContextContract) {
    const comment = await Comment.findOrFail(params.commentId)

    await comment.delete()

    return response.ok({})
  }

  public async like({ request, response, auth }: HttpContextContract) {
    const commentId = request.param('commentId')
    const user = await auth.authenticate()
    let comment = await UsersComment.firstOrCreate(
      {
        userId: user.id,
        commentId: commentId,
      },
      {
        userId: user.id,
        commentId: commentId,
      }
    )
    comment.isLiked = Boolean(!comment.isLiked)
    await comment.save()

    comment = await comment.refresh()

    return response.created({ userComment: comment })
  }
}
