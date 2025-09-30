import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Aprobado from 'App/Models/Aprobado';
import Client from 'App/Models/Client';
import axios from 'axios';

export default class AprobadosController {
    public async store({ request, response }: HttpContextContract) {
        // Solo permitimos los campos que realmente existen en la tabla aprobados
        const data = request.only(['client_id', 'correo', 'type'])
        console.log(data.type)
        // Verificar duplicado
        const existingAprobado = await Aprobado.findBy('client_id', data.client_id)
        if (existingAprobado) {
            return response.status(400).json({ message: 'Ya existe un aprobado para este cliente' })
        }

        // Verificar que el cliente exista
        const client = await Client.find(data.client_id)
        if (!client) {
            return response.status(404).json({ message: 'Cliente no encontrado' })
        }

        // Crear aprobado solo con los campos válidos
        const newAprobado = await Aprobado.create(data)
        console.log(newAprobado.type)

        // Preparar datos para correo

        // Determinar endpoint
        let endpoint = ''
        switch (data.type) {
            case 'empaquetadores':
            endpoint = '/certificados/send-email-empaquetadores'
            break
            case 'carnicos':
            endpoint = '/certificados/send-email-carnicos'
            break
            case 'ambulante':
            endpoint = '/certificados/send-email'
            break
            default:
            return response.status(400).json({ message: 'Tipo de curso no válido' })
        }

        // Llamar microservicio
            try {
            const url = `${process.env.MS_CORREOS}${endpoint}`
            console.log('➡️ Llamando a microservicio de correos en:', url)

            await axios.post(url, {
                email: client.email,
                name: `${client.name} ${client.apellido}`,
                cedula: client.cedula,
                code: String(client.id), // <-- aquí va el ID como código
            })

            return newAprobado
        } catch (error) {
            console.error('Error llamando al microservicio de correos:', error.message)
            return response.status(500).json({ message: 'Error enviando el correo' })
        }
    }



        public async index({request}: HttpContextContract){
            const page =request.input('page', 1);
            const perPage = request.input("per_page", 20)
            let Aprobados:Aprobado[]=await Aprobado.query().paginate(page, perPage)
            return Aprobados;
        }
        public async show({params}:HttpContextContract){
            return Aprobado.findOrFail(params.id)
        }
    
        public async destroy({params, response}: HttpContextContract){
            const theAprobado: Aprobado = await Aprobado.findOrFail(params.id);
            response.status(204);
            return theAprobado.delete()
        }
          public async update({params, request}: HttpContextContract){
            const body = request.body();
            const theAprobado: Aprobado = await Aprobado.findOrFail(params.id);
            theAprobado.correo = body.correo;
            return theAprobado.save();
        }


        public async getAprobadoByClientId({ request }: HttpContextContract) {
            const clientId = request.param('client_id');
    
            if (!clientId) {
                return { message: 'Client ID is required' };
            }
    
            // Buscar el registro de aprobación por client_id
            const aprobado = await Aprobado.query().where('client_id', clientId).first();
    
            if (aprobado) {
                return aprobado;
            } else {
                return null
            }
        }
}
