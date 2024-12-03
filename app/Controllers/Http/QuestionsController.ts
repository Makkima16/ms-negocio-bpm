import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Question from 'App/Models/Question';

export default class QuestionsController {
    public async store({request}:HttpContextContract){
        let body = request.body();
        const theQuestion=await Question.create(body)
        return theQuestion;
    }
    public async index({request}: HttpContextContract){
        const page =request.input('page', 1);
        const perPage = request.input("per_page", 20)
        let Questions:Question[]=await Question.query().paginate(page, perPage)
        return Questions;
    }
    public async show({params}:HttpContextContract){
        return Question.findOrFail(params.id)
    }

    public async destroy({params, response}: HttpContextContract){
        const theQuestion: Question = await Question.findOrFail(params.id);
        response.status(204);
        return theQuestion.delete()
    }
    public async update({params, request}: HttpContextContract){
        const body = request.body();
        const theQuestion: Question = await Question.findOrFail(params.id);
        theQuestion.choice_one = body.choice_one;
        theQuestion.choice_two = body.choice_two;
        theQuestion.choice_three = body.choice_three;
        theQuestion.correct_choice = body.correct_choice;

        return theQuestion.save();
    }
}
