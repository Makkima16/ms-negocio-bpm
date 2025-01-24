import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Modulo from 'App/Models/Modulo';


export default class ModulosController {
  public async store({request}:HttpContextContract){
    let body = request.body();
    const modulo=await Modulo.create(body)
    return modulo;
}
    public async index({request}: HttpContextContract){
        const page =request.input('page', 1);
        const perPage = request.input("per_page", 20)
        let Modulos:Modulo[]=await Modulo.query().paginate(page, perPage)
        return Modulos;
    }
    public async show({params}:HttpContextContract){
        return Modulo.findOrFail(params.id)
    }
    public async update({params, request}: HttpContextContract){
        const body = request.body();
        const theModulo: Modulo = await Modulo.findOrFail(params.id);
        theModulo.link = body.link;
        theModulo.titulo=body.title;
        theModulo.informacion=body.informacion;
        theModulo.introduccion=body.introduccion;
        theModulo.conclusion=body.conclusion
        theModulo.imagen_url=body.imagen_url
        theModulo.pdf_name=body.pdf_name
        theModulo.curso_tipo=body.curso_tipo

        return theModulo.save();
    }
    public async destroy({params, response}: HttpContextContract){
        const theModulo: Modulo = await Modulo.findOrFail(params.id);
        response.status(204);
        return theModulo.delete()
    }

    public async getExamsByModule({ params, response }) {
        const moduleId = params.module_id;
        const exams = await Database
          .from('exams')
          .where('module_id', moduleId)
          .select('*');
        return response.json(exams);
      }
      

      public async listByCourseType({ request }: HttpContextContract) {
        const cursoTipo = request.input('curso_tipo'); // Obtén el tipo de curso del request
        const page = request.input('page', 1); // Opcional: para paginar
        const perPage = request.input('per_page', 20); // Opcional: para paginar
        
        // Realiza la consulta filtrando por curso_tipo
        const modulos = await Modulo.query()
            .where('curso_tipo', cursoTipo)
            .paginate(page, perPage);
    
        return modulos;
    }
    
}
