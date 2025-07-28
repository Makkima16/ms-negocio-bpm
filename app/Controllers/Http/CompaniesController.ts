import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Company from 'App/Models/Company';

export default class CompaniesController {
        public async store({request}:HttpContextContract){
            let body = request.body();
            const theCompany=await Company.create(body)
            return theCompany;
        }
        public async index({request}: HttpContextContract){
            const page =request.input('page', 1);
            const perPage = request.input("per_page", 20)
            let Companys:Company[]=await Company.query().paginate(page, perPage)
            return Companys;
        }
        public async show({params}:HttpContextContract){
            return Company.findOrFail(params.id)
        }
    
        public async destroy({params, response}: HttpContextContract){
            const theCompany: Company = await Company.findOrFail(params.id);
            response.status(204);
            return theCompany.delete()
        }
        public async byAlarmId({ params }: HttpContextContract) {
            const alarmaId = params.alarma_id;        if (!alarmaId) {
                return { error: 'alarma_id es requerido' }
            }
            const Companys = await Company.query().where('alarma_id', alarmaId)
            return Companys
        }
}
