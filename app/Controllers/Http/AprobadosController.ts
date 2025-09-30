import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Aprobado from 'App/Models/Aprobado';
import axios from 'axios';

export default class AprobadosController {
    public async store({ request, response }: HttpContextContract) {
        const body = request.body()

        // Verificar si ya existe un aprobado para este cliente
        const existingAprobado = await Aprobado.findBy('client_id', body.client_id)
        if (existingAprobado) {
            return response
            .status(400)
            .json({ message: 'Ya existe un aprobado para este cliente' })
        }

        // Crear aprobado en DB
        const newAprobado = await Aprobado.create(body)

        // Extraer info para enviar al microservicio de correos
        const { email, name, cedula, type, client_id } = body

        if (!email || !name || !cedula || !type || !client_id) {
            return response
            .status(400)
            .json({ message: 'Faltan datos para enviar el correo' })
        }

        // Determinar endpoint del microservicio
        let endpoint = ''
        switch (type) {
            case 'empaquetadores':
            endpoint = '/send-email-empaquetadores'
            break
            case 'carnicos':
            endpoint = '/send-email-carnicos'
            break
            case 'ambulante':
            endpoint = '/send-email'
            break
            default:
            return response
                .status(400)
                .json({ message: 'Tipo de curso no válido' })
        }

        try {
            // Llamada al microservicio con el "code" como client_id
            await axios.post(`${process.env.MS_CORREOS}${endpoint}`, {
            email,
            name,
            cedula,
            code: client_id, 
            })

            return newAprobado
        } catch (error) {
            console.error('Error llamando al microservicio de correos:', error.message)
            return response
            .status(500)
            .json({ message: 'Error enviando el correo' })
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
