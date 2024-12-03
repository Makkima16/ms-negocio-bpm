import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/examen","ExamsController.store");
    Route.get("/examen","ExamsController.index");
    Route.get("/examen/:id","ExamsController.show");
    Route.put("/examen/:id","ExamsController.update");
    Route.delete("/examen/:id","ExamsController.destroy");
    Route.post('/exam/check-approval', 'ExamsController.checkModuleApproval')
    Route.get("/examenes","ExamsController.findAll");
    Route.get("/modulos/:module_id/questions", "ExamsController.getQuestionsByModule");

    
})