import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/records","RegistersController.store");
    Route.get("/records","RegistersController.index");
    Route.get("/records/:id","RegistersController.show");
    Route.delete("/records/:id","RegistersController.destroy");

})