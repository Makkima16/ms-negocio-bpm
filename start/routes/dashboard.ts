import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get('/dashboard/summary', 'DashboardController.summary')

    
})