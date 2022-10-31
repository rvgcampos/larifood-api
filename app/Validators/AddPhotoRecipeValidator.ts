import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AddPhotoRecipeValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    file: schema.file({
      size: '20mb',
      extnames: ['jpg', 'png', 'jpeg'],
    }),
    idRecipe: schema.number(),
  })

  public messages: CustomMessages = {}
}
