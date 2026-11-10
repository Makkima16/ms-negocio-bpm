import Route from '@ioc:Adonis/Core/Route'

// ePayco confirmation webhook (validated through its signature).
Route.post('/api/webhook/epayco', 'PaymentsController.handleWebhook')

Route.post('/payments', 'PaymentsController.store').middleware('auth')

Route.group(() => {
  Route.get('/payments', 'PaymentsController.index')
  Route.get('/payments/:id', 'PaymentsController.show')
  Route.put('/payments/:id', 'PaymentsController.update')
  Route.delete('/payments/:id', 'PaymentsController.destroy')
}).middleware('admin')
