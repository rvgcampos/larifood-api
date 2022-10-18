import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Recipe from 'App/Models/Recipe'
import Similarity from 'App/Models/Similarity'

export default class SimilarityRecipesController {
  public async calculate({ response }: HttpContextContract) {
    const recipes = await Recipe.query().preload('ingredients')

    const r = await Recipe.query()

    for (const recipe of r) {
      for (const recipeComp of r) {
        await Similarity.query()
          .delete()
          .where('recipeFromId', recipe.id)
          .andWhere('recipeToId', recipeComp.id)
      }
    }

    const recipesIngredients: Object[] = []
    for (const recipe of recipes) {
      const ingredientsName: any[] = []
      for (const obj of recipe.ingredients) {
        ingredientsName.push(obj.name)
      }
      const recipeId = recipe.id
      const obj = {}
      obj[recipeId] = ingredientsName
      recipesIngredients.push(obj)
    }

    for (const recipe of recipesIngredients) {
      for (const recipeCompare of recipesIngredients) {
        const similaridade = this.similaridade(
          Object.values(recipe)[0],
          Object.values(recipeCompare)[0]
        )
        await Similarity.create({
          recipeFromId: Number(Object.keys(recipe)[0]),
          recipeToId: Number(Object.keys(recipeCompare)[0]),
          similarity: similaridade,
        })
      }
    }

    let similaridades = await Similarity.query()
      .where('recipe_from_id', 1)
      .andWhereNot('recipe_to_id', 1)
      .orderBy('similarity', 'desc')
      .limit(20)
      .preload('recipeTo')

    similaridades = similaridades.sort(() => Math.random() - 0.5)

    response.created(similaridades)
  }

  public calculaSimilaridade(vetor1: number[], vetor2: number[]) {
    let soma = 0
    let somaA = 0
    let somaB = 0
    for (let i = 0; i < vetor1.length; i++) {
      soma += vetor1[i] * vetor2[i]
    }

    for (const v1 of vetor1) {
      somaA += v1 * v1
    }
    for (const v2 of vetor2) {
      somaB += v2 * v2
    }

    return soma / (Math.sqrt(somaA) * Math.sqrt(somaB))
  }

  public similaridade(receita1: [], receita2: []) {
    let receitaAtualizada1 = this.nlp(receita1)
    let receitaAtualizada2 = this.nlp(receita2)

    let todasPalavras = [...new Set([...receitaAtualizada1, ...receitaAtualizada2])]

    let vetor1: number[] = []
    let vetor2: number[] = []
    for (const i in todasPalavras) {
      vetor1.push(0)
      vetor2.push(0)
    }
    // console.log(vetor1)
    // console.log(vetor2)

    for (const palavra of receita1) {
      vetor1[todasPalavras.indexOf(palavra)] += 1
    }
    for (const palavra of receita2) {
      vetor2[todasPalavras.indexOf(palavra)] += 1
    }

    // console.log(vetor1)
    // console.log(vetor2)

    return this.calculaSimilaridade(vetor1, vetor2)
  }

  public nlp(receita: string[]) {
    var snowball = require('node-snowball')
    let receitaAtualizada: string[] = []
    for (var ingrediente of receita) {
      // LOWERCASE
      let ingredienteAtualizado = ingrediente.toLowerCase()
      // PUNCTUATION REMOVAL
      for (var pontuacao of [
        '‘',
        '!',
        '”',
        '#',
        '$',
        '%',
        '&',
        "'",
        '(',
        ')',
        '*',
        '+',
        ',',
        '-',
        '.',
        ',',
        '/',
        ':',
        ';',
        '?',
        '@',
        '[',
        '\\',
        ']',
        '^',
        '_',
        '`',
        '{',
        '|',
        '}',
        '~',
        '’',
        ']',
      ]) {
        if (ingredienteAtualizado.includes(pontuacao)) {
          ingredienteAtualizado = ingredienteAtualizado.replace(pontuacao, '')
        }
      }

      // STOP WORD REMOVAL
      for (var stopWord of ['de', 'DE', 'De']) {
        if (ingredienteAtualizado.includes(stopWord)) {
          ingredienteAtualizado = ingredienteAtualizado.replace(stopWord, '')
        }
      }

      // ACENTOS
      for (var char of ingredienteAtualizado) {
        if (char.toLowerCase() === 'ç') {
          ingredienteAtualizado = ingredienteAtualizado.replace(char, 'c')
        }
        if (
          char.toLowerCase() === 'á' ||
          char.toLowerCase() === 'â' ||
          char.toLowerCase() === 'à' ||
          char.toLowerCase() === 'ã'
        ) {
          ingredienteAtualizado = ingredienteAtualizado.replace(char, 'a')
        }
        if (char.toLowerCase() === 'é' || char.toLowerCase() === 'ê') {
          ingredienteAtualizado = ingredienteAtualizado.replace(char, 'e')
        }
        if (char.toLowerCase() === 'í' || char.toLowerCase() === 'î') {
          ingredienteAtualizado = ingredienteAtualizado.replace(char, 'i')
        }
        if (char.toLowerCase() === 'ó' || char.toLowerCase() === 'ô') {
          ingredienteAtualizado = ingredienteAtualizado.replace(char, 'o')
        }
        if (char.toLowerCase() === 'ú' || char.toLowerCase() === 'û') {
          ingredienteAtualizado = ingredienteAtualizado.replace(char, 'u')
        }
      }

      // STEMMING
      ingredienteAtualizado = snowball.stemword(ingredienteAtualizado, 'portuguese')

      // TRIM
      ingredienteAtualizado = ingredienteAtualizado.trim()

      receitaAtualizada.push(ingredienteAtualizado)
    }
    return receitaAtualizada
  }
}
