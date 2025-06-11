import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post("/alarm", "AlarmsController.store")
  Route.get("/alarm", "AlarmsController.index")
  Route.get("/alarm/:id", "AlarmsController.show")
  Route.delete("/alarm/:id", "AlarmsController.destroy")
  Route.put("/alarm/:id", "AlarmsController.update")
  Route.get("/alarms/check", "AlarmsController.checkNearAlarms")
})
