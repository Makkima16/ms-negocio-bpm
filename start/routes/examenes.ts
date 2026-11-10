import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/examen/:id', 'ExamsController.show')
  Route.post('/exam/check-approval', 'ExamsController.checkModuleApproval')
  Route.get('/modulos/:module_id/questions', 'ExamsController.getQuestionsByModule')
}).middleware('auth')

Route.group(() => {
  Route.post('/examen', 'ExamsController.store')
  Route.get('/examen', 'ExamsController.index')
  Route.get('/examenes', 'ExamsController.findAll')
  Route.put('/examen/:id', 'ExamsController.update')
  Route.delete('/examen/:id', 'ExamsController.destroy')
}).middleware('admin')
