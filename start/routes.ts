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

// FEED
Route.get('/feed', 'FeedsController.index')

// FAVORITES
Route.post('/favorite/:recipeId', 'FavoritesController.favorite')
Route.post('/unfavorite/:recipeId', 'FavoritesController.unFavorite')
Route.get('/favorites', 'FavoritesController.index')

// RECIPES
Route.post('/recipes', 'RecipesController.store')
Route.get('/recipes/:id', 'RecipesController.show')
Route.put('/recipes/:id', 'RecipesController.update')
Route.delete('/recipes/:id', 'RecipesController.destroy')

// COMMENT
Route.post('/recipes/:id/comment', 'CommentsController.store')
Route.put('/recipes/:id/comment/:commentId', 'CommentsController.update')
Route.post('/recipes/:id/comment/:commentId/like', 'CommentsController.like')

// SEGUIDORES
Route.post('/follow', 'UnfollowsController.follow').middleware('auth')
Route.post('/unfollow', 'UnfollowsController.unFollow').middleware('auth')
