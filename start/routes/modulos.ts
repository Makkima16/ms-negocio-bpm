import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/modulos","ModulosController.store");
    Route.get("/modulos","ModulosController.index");
    Route.put("/modulos/:id","ModulosController.update");
    Route.delete("/modulos/:id","ModulosController.destroy");
    Route.get("/modulos/:module_id/exams", "ModulosController.getExamsByModule");
    Route.get("/modulos/:id","ModulosController.show");
    Route.get('/modulos/type_course', 'ModulosController.listByCourseType');

    
})