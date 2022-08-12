import Database from '@ioc:Adonis/Lucid/Database'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Recipe from 'App/Models/Recipe'
import Similarity from 'App/Models/Similarity'
import SimilaritiesUser from 'App/Models/SimilaritiesUser'
import User from 'App/Models/User'

export default class SimilarityUsersController {
  public async calculate({ response }: HttpContextContract) {
    let users = await User.query().preload('likes')
    users = users.filter((value) => {
      return value.likes.length !== 0
    })

    const usersLikes: Object[] = []
    for await (const user of users) {
      const userId = user.id
      const likesIds: any[] = []
      for (const like of user.likes) {
        likesIds.push(like.id)
      }
      const obj = {}
      obj[userId] = likesIds
      usersLikes.push(obj)
    }

    // console.log(usersLikes)

    for (const user of usersLikes) {
      for (const userCompare of usersLikes) {
        const similaridade = this.similaridade(
          Object.values(user)[0],
          Object.values(userCompare)[0]
        )
        await SimilaritiesUser.create({
          userFromId: Number(Object.keys(user)[0]),
          userToId: Number(Object.keys(userCompare)[0]),
          similarity: similaridade,
        })
      }
    }

    const test = await Database.query().from('similarities_users')
    console.log(test)

    // let similaridades = await SimilarityUser.query()
    //   .where('recipe_from_id', 1)
    //   .andWhereNot('recipe_to_id', 1)
    //   .orderBy('similarity', 'desc')
    //   .limit(20)
    //   .preload('recipeTo')

    // similaridades = similaridades.sort(() => Math.random() - 0.5)

    response.created(users)
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
    let todasPalavras = [...new Set([...receita1, ...receita2])]
    // console.log(todasPalavras)

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
}
