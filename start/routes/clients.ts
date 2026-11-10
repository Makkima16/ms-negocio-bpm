import Route from '@ioc:Adonis/Core/Route'

// Public registration: a new user also needs its client profile.
Route.post('/clients', 'ClientsController.store')

Route.group(() => {
  Route.get('/clients/me', 'ClientsController.me')
  Route.get('/buscar_Email', 'ClientsController.buscar_Email')
  Route.get('/buscar_UserID', 'ClientsController.buscar_UserID')
  Route.get('/clients/:id/payments/accepted', 'ClientsController.hasAcceptedPayments')
  Route.get('/clients/:id/payments/exist', 'ClientsController.hasExistPayments')
}).middleware('auth')

Route.group(() => {
  Route.get('/clients', 'ClientsController.index')
  Route.get('/clients/:id', 'ClientsController.show')
  Route.put('/clients/:id', 'ClientsController.update')
  Route.delete('/clients/:id', 'ClientsController.destroy')
}).middleware('admin')
