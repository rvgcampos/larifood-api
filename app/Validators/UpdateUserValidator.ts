import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({}),
    description: schema.string({}),
    username: schema.string({}),
    email: schema.string({}, [rules.email()]),
  })

  public messages: CustomMessages = {}
}
