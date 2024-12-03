import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/admin","AdministratorsController.store");
    Route.get("/admin","AdministratorsController.index");
    Route.get("/admin/:id","AdministratorsController.show");
    Route.delete("/admin/:id","AdministratorsController.destroy");


})