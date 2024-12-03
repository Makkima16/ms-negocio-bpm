import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/clients","ClientsController.store");
    Route.get("/clients","ClientsController.index");
    Route.get("/clients/:id","ClientsController.show");
    Route.put("/clients/:id","ClientsController.update");
    Route.delete("/clients/:id","ClientsController.destroy");
    Route.get('/buscar_UserID', 'ClientsController.buscar_UserID');
    Route.get('/buscar_Email', 'ClientsController.buscar_Email');
    Route.get('/clients/:id/payments/accepted', 'ClientsController.hasAcceptedPayments')

})