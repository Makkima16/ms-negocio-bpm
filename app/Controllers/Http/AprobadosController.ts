import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Aprobado from 'App/Models/Aprobado';

export default class AprobadosController {

    public async store({ request }: HttpContextContract) {
        const body = request.body()

        // Verificar si ya existe un pago con la misma referencia
        const existingAprobado = await Aprobado.findBy('client_id', body.client_id)
        if (existingAprobado) {
        return null
        }

        // Crear el nuevo pago
        const newAprobado = await Aprobado.create(body)
        return newAprobado
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
