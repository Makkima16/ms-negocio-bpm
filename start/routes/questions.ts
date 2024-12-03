import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/questions","QuestionsController.store");
    Route.get("/questions","QuestionsController.index");
    Route.get("/questions/:id","QuestionsController.show");
    Route.put("/questions/:id","QuestionsController.update");
    Route.delete("/questions/:id","QuestionsController.destroy");
})