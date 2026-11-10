import Route from '@ioc:Adonis/Core/Route'

// Public lead form + company listing.
Route.get('/companies', 'CompaniesController.index')
Route.get('/companies/:id', 'CompaniesController.show')
Route.post('/companies', 'CompaniesController.store')

Route.group(() => {
  Route.put('/companies/:id', 'CompaniesController.update')
  Route.delete('/companies/:id', 'CompaniesController.destroy')
}).middleware('admin')
