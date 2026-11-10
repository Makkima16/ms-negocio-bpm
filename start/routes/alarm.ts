import Route from '@ioc:Adonis/Core/Route'

// Cron/automation endpoint, protected with a shared secret token.
Route.get('/alarms/check', 'AlarmsController.checkNearAlarms')

Route.post('/alarm', 'AlarmsController.store').middleware('auth')

Route.group(() => {
  Route.get('/alarm', 'AlarmsController.index')
  Route.get('/alarm/:id', 'AlarmsController.show')
  Route.put('/alarm/:id', 'AlarmsController.update')
  Route.delete('/alarm/:id', 'AlarmsController.destroy')
}).middleware('admin')
