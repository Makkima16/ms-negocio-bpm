import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/patients", "PatientsController.store")
    Route.get("/patients", "PatientsController.index")
    Route.get("/patients/:id", "PatientsController.show")
    Route.put("/patients/:id", "PatientsController.update")
    Route.get("/patients/:alarma_id/alarms", "PatientsController.byAlarmId")

})