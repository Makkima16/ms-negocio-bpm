import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Patient from 'App/Models/Patient';

export default class PatientsController {
    public async store({request}:HttpContextContract){
        let body = request.body();
        const thePatient=await Patient.create(body)
        return thePatient;
    }
    public async index({request}: HttpContextContract){
        const page =request.input('page', 1);
        const perPage = request.input("per_page", 20)
        let Patients:Patient[]=await Patient.query().paginate(page, perPage)
        return Patients;
    }
    public async show({params}:HttpContextContract){
        return Patient.findOrFail(params.id)
    }

    public async destroy({params, response}: HttpContextContract){
        const thePatient: Patient = await Patient.findOrFail(params.id);
        response.status(204);
        return thePatient.delete()
    }
    public async byAlarmId({ params }: HttpContextContract) {
        const alarmaId = params.alarma_id;        if (!alarmaId) {
            return { error: 'alarma_id es requerido' }
        }
        const patients = await Patient.query().where('alarma_id', alarmaId)
        return patients
    }
}
