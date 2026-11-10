import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/aprobatorio', 'AprobadosController.store')
  Route.get('/aprobatorio/client/:client_id', 'AprobadosController.getAprobadoByClientId')
}).middleware('auth')

Route.group(() => {
  Route.get('/aprobatorio', 'AprobadosController.index')
  Route.get('/aprobatorio/:id', 'AprobadosController.show')
  Route.put('/aprobatorio/:id', 'AprobadosController.update')
  Route.delete('/aprobatorio/:id', 'AprobadosController.destroy')
}).middleware('admin')
