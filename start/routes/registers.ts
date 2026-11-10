import Route from '@ioc:Adonis/Core/Route'

Route.post('/records', 'RegistersController.store').middleware('auth')

Route.group(() => {
  Route.get('/records', 'RegistersController.index')
  Route.get('/records/:id', 'RegistersController.show')
  Route.delete('/records/:id', 'RegistersController.destroy')
}).middleware('admin')
