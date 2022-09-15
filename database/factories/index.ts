import Factory from '@ioc:Adonis/Lucid/Factory'
import Category from 'App/Models/Category'
import Comment from 'App/Models/Comment'
import FavoritesFolder from 'App/Models/FavoritesFolder'
import Ingredient from 'App/Models/Ingredient'
import PrepareMode from 'App/Models/PrepareMode'
import PrepareTimeUnit from 'App/Models/PrepareTimeUnit'
import QtdUnit from 'App/Models/QtdUnit'
import Recipe from 'App/Models/Recipe'
import User from 'App/Models/User'

export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    name: faker.name.findName(),
    username: faker.name.firstName(),
    email: faker.internet.email(),
    description: faker.lorem.sentence(),
    password: faker.internet.password(),
  }
}).build()

export const CategoryFactory = Factory.define(Category, ({}) => {
  return {
    name: 'Doces',
    active: true,
  }
}).build()

export const PrepareTimeUnitFactory = Factory.define(PrepareTimeUnit, ({}) => {
  return {
    name: 'min',
  }
}).build()

export const QtdUnitFactory = Factory.define(QtdUnit, ({}) => {
  return {
    name: 'KG',
  }
}).build()

export const RecipeFactory = Factory.define(Recipe, ({ faker }) => {
  return {
    name: faker.name.firstName(),
    prepareTime: Number(faker.random.numeric()),
  }
}).build()

export const IngredientFactory = Factory.define(Ingredient, ({ faker }) => {
  return {
    name: faker.name.firstName(),
    qtd: Number(faker.random.numeric()),
  }
}).build()

export const PrepareModeFactory = Factory.define(PrepareMode, ({ faker }) => {
  return {
    description: faker.lorem.lines(),
  }
}).build()

export const CommentFactory = Factory.define(Comment, ({ faker }) => {
  return {
    content: faker.lorem.slug(),
  }
}).build()

export const FavoritesFolderFactory = Factory.define(FavoritesFolder, ({ faker }) => {
  return {
    name: faker.name.firstName(),
  }
}).build()
