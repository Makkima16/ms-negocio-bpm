import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/aprobatorio","AprobadosController.store");
    Route.get("/aprobatorio","AprobadosController.index");
    Route.get("/aprobatorio/:id","AprobadosController.show");
    Route.delete("/aprobatorio/:id","AprobadosController.destroy");
    Route.put("/aprobatorio/:id","AprobadosController.update");
    Route.get('/aprobatorio/client/:client_id', 'AprobadosController.getAprobadoByClientId');


})