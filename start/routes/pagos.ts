import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/payments", "PaymentsController.store")
    Route.get("/payments", "PaymentsController.index")
    Route.get("/payments/:id", "PaymentsController.show")
    Route.put("/payments/:id", "PaymentsController.update")
    Route.post('/api/webhook/epayco', 'PaymentsController.handleWebhook')

})