import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Administrator from 'App/Models/Administrator';

export default class AdministratorsController {
    public async store({request}:HttpContextContract){
        let body = request.body();
        const theAdministrator=await Administrator.create(body)
        return theAdministrator;
    }
    public async index({request}: HttpContextContract){
        const page =request.input('page', 1);
        const perPage = request.input("per_page", 20)
        let Administrators:Administrator[]=await Administrator.query().paginate(page, perPage)
        return Administrators;
    }
    public async show({params}:HttpContextContract){
        return Administrator.findOrFail(params.id)
    }

    public async destroy({params, response}: HttpContextContract){
        const theAdministrator: Administrator = await Administrator.findOrFail(params.id);
        response.status(204);
        return theAdministrator.delete()
    }
}
