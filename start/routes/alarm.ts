import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post("/alarm","AlarmController.store");
    Route.get("/alarm","AlarmController.index");
    Route.get("/alarm/:id","AlarmController.show");
    Route.delete("/alarm/:id","AlarmController.destroy");
    Route.put("/alarm/:id","AlarmController.update");
    Route.get('/alarms/check', 'AlarmNotificationsController.checkNearAlarms')


})