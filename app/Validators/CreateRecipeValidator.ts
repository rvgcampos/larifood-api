import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateRecipeValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string(),
    isPrivate: schema.boolean(),
    prepareTime: schema.number(),
    userId: schema.number([rules.exists({ table: 'users', column: 'id' })]),
    prepareTimeUnitId: schema.number([rules.exists({ table: 'prepare_time_units', column: 'id' })]),
    categoryId: schema.number([rules.exists({ table: 'categories', column: 'id' })]),
    ingredients: schema.array([rules.minLength(1)]).members(
      schema.object().members({
        qtd_units_id: schema.number([rules.exists({ table: 'qtd_units', column: 'id' })]),
        name: schema.string(),
        qtd: schema.number(),
      })
    ),
    prepareModes: schema.array([rules.minLength(1)]).members(
      schema.object().members({
        description: schema.string(),
        order: schema.number(),
      })
    ),
  })

  public messages: CustomMessages = {}
}
