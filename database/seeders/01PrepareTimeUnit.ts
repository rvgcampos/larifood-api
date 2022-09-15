import QtdUnit from 'App/Models/QtdUnit'
import Category from 'App/Models/Category'
import PrepareTimeUnit from 'App/Models/PrepareTimeUnit'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run(): Promise<void> {
    await PrepareTimeUnit.create({ name: 'min' })
    await PrepareTimeUnit.create({ name: 'h' })

    await Category.create({ name: 'Doces' })
    await Category.create({ name: 'Salgadas' })

    await QtdUnit.create({ name: 'KG' })
    await QtdUnit.create({ name: 'g' })
    await QtdUnit.create({ name: 'xic(s)' })
  }
}
