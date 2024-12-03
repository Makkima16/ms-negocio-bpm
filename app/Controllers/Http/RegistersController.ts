import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Register from 'App/Models/Register';

export default class RegistersController {
    public async store({request}:HttpContextContract){
        let body = request.body();
        const theRegister=await Register.create(body)
        return theRegister;
    }
    public async index({request}: HttpContextContract){
        const page =request.input('page', 1);
        const perPage = request.input("per_page", 20)
        let Registers:Register[]=await Register.query().paginate(page, perPage)
        return Registers;
    }
    public async show({params}:HttpContextContract){
        return Register.findOrFail(params.id)
    }

    public async destroy({params, response}: HttpContextContract){
        const theRegister: Register = await Register.findOrFail(params.id);
        response.status(204);
        return theRegister.delete()
    }
}
