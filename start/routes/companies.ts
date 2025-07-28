import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/companies","CompaniesController.store");
    Route.get("/companies","CompaniesController.index");
    Route.get("/companies/:id","CompaniesController.show");
    Route.delete("/companies/:id","CompaniesController.destroy");
    Route.put("/companies/:id","CompaniesController.update");


})