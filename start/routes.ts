import Route from '@ioc:Adonis/Core/Route'

// USERS
Route.get('/users/:id', 'UsersController.show').middleware('auth') // Ver perfil de outro usuário
Route.get('/users', 'UsersController.me').middleware('auth') // Ver o proprio perfil
Route.post('/users', 'UsersController.store') // Fazer o cadastro
Route.post('/forgot-password', 'PasswordsController.forgotPassword') // Esqueceu a senha
Route.post('/reset-password', 'PasswordsController.resetPassword') // Resetar a senha
Route.post('/sessions', 'SessionsController.store') // Fazer login
Route.put('/users/:id', 'UsersController.update').middleware('auth') // Atualizar perfil
Route.delete('/sessions', 'SessionsController.destroy') // Fazer logout

// AVATAR
Route.put('/avatar/users', 'AvatarController.update').middleware('auth') // Atualizar foto perfil
Route.delete('/avatar/users', 'AvatarController.destroy').middleware('auth') // Deletar foto do perfil
Route.get('/uploads/:file', 'UploadsController.show') // Ver foto do perfil
Route.get('/recipes-file/:file', 'UploadsController.showRecipe') // Ver foto do perfil
Route.post('/photo/recipe', 'AvatarController.addPostPhoto').middleware('auth')

// LIKE
Route.post('/recipes/:recipeId/like', 'LikesController.like') // Dar like em receita

// FEED
Route.get('/chronological-feed', 'FeedsController.chronologicalFeed').middleware('auth') // Feed cronologico
Route.get('/recomendative-feed', 'FeedsController.recomendativeFeed').middleware('auth') // Feed recomendativo

// SEARCH
Route.get('/search-recipe/:searchString', 'SearchesController.searchRecipes') // Pesquisar receitas pelo nome
Route.get('/search-user/:searchString', 'SearchesController.searchUsers') // Pesquisar usuários
Route.get('/search-recipe/:searchString/:userId', 'SearchesController.searchRecipesByUser') // Pesquisar receitas no perfil do usuário
Route.post('/search-recipe', 'SearchesController.searchRecipesByIngredients') // Pesquisas receitas por ingredientes

// FOLLOWERS
Route.post('/follow', 'UnfollowsController.follow').middleware('auth') // Seguir usuário
Route.post('/unfollow', 'UnfollowsController.unFollow').middleware('auth') // Deixar de seguir

// RECIPES
Route.post('/recipes', 'RecipesController.store') // Cadastrar receita
Route.get('/recipes/:id', 'RecipesController.show') // Mostrar receita
Route.put('/recipes/:id', 'RecipesController.update') // Editar receuta
Route.delete('/recipes/:id', 'RecipesController.destroy') // Excluir receita

// SIMILARIDADE
Route.get('/similarity-recipes', 'SimilarityRecipesController.calculate') // Similaridade entre receitas
Route.get('/similarity-users', 'SimilarityUsersController.calculate') // Similaridade entre usuários
Route.get('/similarity/:id', 'SimilarityController.calculate') // Similaridade entre receitas

// FAVORITES
Route.post('/favorite/:recipeId', 'FavoritesController.favorite') // Favoritar receita
Route.post('/unfavorite/:recipeId', 'FavoritesController.unFavorite') // Desfavoritar
Route.get('/favorites', 'FavoritesController.index') // Obter os favoritos

// COMMENT
Route.post('/recipes/:id/comment', 'CommentsController.store') // Comentar
Route.put('/recipes/:id/comment/:commentId', 'CommentsController.update') // Editar comentário
Route.post('/recipes/:id/comment/:commentId/like', 'CommentsController.like') // Curtir Comentário

// UTILS
Route.get('/prepare-time-unit', 'UtilsController.getPrepareTimeUnit')
Route.get('/categories', 'UtilsController.getCategories')
Route.get('/qtd-unit', 'UtilsController.getQtdUnits')
