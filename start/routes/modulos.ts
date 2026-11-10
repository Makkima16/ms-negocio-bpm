import Route from '@ioc:Adonis/Core/Route'

Route.get('/modulos', 'ModulosController.index')
Route.get('/modulos/tipo/:curso_tipo', 'ModulosController.listByCursoTipo')
Route.get('/modulos/:id', 'ModulosController.show')

Route.group(() => {
  Route.get('/modulos/:module_id/exams', 'ModulosController.getExamsByModule')
}).middleware('auth')

Route.group(() => {
  Route.post('/modulos', 'ModulosController.store')
  Route.put('/modulos/:id', 'ModulosController.update')
  Route.delete('/modulos/:id', 'ModulosController.destroy')
}).middleware('admin')
