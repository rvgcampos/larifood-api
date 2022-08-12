import Route from '@ioc:Adonis/Core/Route'

// USERS
Route.get('/users/:id', 'UsersController.show').middleware('auth')
Route.get('/users', 'UsersController.me')
Route.post('/users', 'UsersController.store')
Route.post('/forgot-password', 'PasswordsController.forgotPassword')
Route.post('/reset-password', 'PasswordsController.resetPassword')
Route.post('/sessions', 'SessionsController.store')
Route.put('/users/:id', 'UsersController.update').middleware('auth')
Route.delete('/sessions', 'SessionsController.destroy')

// AVATAR
Route.put('/users/avatar', 'AvatarController.update').middleware('auth')
Route.delete('/users/avatar', 'AvatarController.destroy').middleware('auth')
Route.get('/uploads/:file', 'UploadsController.show').middleware('auth')

// SIMILARIDADE
Route.get('/similarity', 'SimilarityController.calculate')
Route.get('/similarity-users', 'SimilarityUsersController.calculate')

// LIKE
Route.post('/recipes/:recipeId/like', 'LikesController.like')

// FEED
Route.get('/feed', 'FeedsController.index')
Route.get('/recomendative-feed', 'FeedsController.recomendativeFeed')

// FAVORITES
Route.post('/favorite/:recipeId', 'FavoritesController.favorite')
Route.post('/unfavorite/:recipeId', 'FavoritesController.unFavorite')
Route.get('/favorites', 'FavoritesController.index')

// SEARCH
Route.get('/search-user/:searchString', 'SearchesController.searchUsers')
Route.get('/search-recipe/:searchString', 'SearchesController.searchRecipes')
Route.get('/search-recipe/:searchString/:userId', 'SearchesController.searchRecipesByUser')
Route.post('/search-recipe', 'SearchesController.searchRecipesByIngredients')

// RECIPES
Route.post('/recipes', 'RecipesController.store')
Route.get('/recipes/:id', 'RecipesController.show')
Route.put('/recipes/:id', 'RecipesController.update')
Route.delete('/recipes/:id', 'RecipesController.destroy')

// COMMENT
Route.post('/recipes/:id/comment', 'CommentsController.store')
Route.put('/recipes/:id/comment/:commentId', 'CommentsController.update')
Route.post('/recipes/:id/comment/:commentId/like', 'CommentsController.like')

// FOLLOWERS
Route.post('/follow', 'UnfollowsController.follow').middleware('auth')
Route.post('/unfollow', 'UnfollowsController.unFollow').middleware('auth')
