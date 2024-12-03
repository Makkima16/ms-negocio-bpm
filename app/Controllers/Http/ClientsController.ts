import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client';

export default class ClientsController {
    public async store({request}:HttpContextContract){
        let body = request.body();
        const theClient=await Client.create(body)
        return theClient;
    }
    public async index({request}: HttpContextContract){
        const page =request.input('page', 1);
        const perPage = request.input("per_page", 20)
        let Clients:Client[]=await Client.query().paginate(page, perPage)
        return Clients;
    }
    public async show({params}:HttpContextContract){
        return Client.findOrFail(params.id)
    }

    public async destroy({params, response}: HttpContextContract){
        const theClient: Client = await Client.findOrFail(params.id);
        response.status(204);
        return theClient.delete()
    }

  // Método para verificar si un cliente tiene pagos aceptados
  public async hasAcceptedPayments({ params, response }: HttpContextContract) {
    const client = await Client.find(params.id) // Buscar cliente por ID

    if (!client) {
      return response.status(404).json({ message: 'Cliente no encontrado' }) // Si no se encuentra el cliente
    }

    // Buscar pagos aceptados para este cliente
    const acceptedPayments = await client
      .related('payment') // Accede a los pagos relacionados con el cliente
      .query() // Realiza la consulta
      .whereIn('state', ['Aceptada', 'Pendiente']) // Filtra los pagos cuyo estado es "Aceptada" o "Pendiente"

    // Si encontró pagos aceptados, devuelve `true`, de lo contrario `false`
    const hasAccepted = acceptedPayments.length > 0
    return response.status(200).json({ hasAccepted })
  }
  
    public async buscar_UserID({ request, response }: HttpContextContract) {
        const userId = request.qs().user_id
        let client
        client = await Client.query().where('user_id', userId).first()
        return response.json(client)
      }

    public async buscar_Email({ request, response }: HttpContextContract) {
    const email = request.qs().email
    let client
    client = await Client.query().where('email', email).first()
    return response.json(client)
    }
    }