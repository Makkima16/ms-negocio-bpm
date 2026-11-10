import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/patients', 'PatientsController.store')
  Route.put('/patients/:id', 'PatientsController.update')
  Route.get('/patients/:alarma_id/alarms', 'PatientsController.byAlarmId')
}).middleware('auth')

Route.group(() => {
  Route.get('/patients', 'PatientsController.index')
  Route.get('/patients/:id', 'PatientsController.show')
}).middleware('admin')
