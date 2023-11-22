import Competitors from "../models/CompetitorsSchema";
import Tournament from "../models/TournamentsSchema";
import User from "../models/UserSchema";
import { ControllerResponse } from "../types/app";

export class CompetitorsController {

    static RegisterCompetitor = async(uid: string, tid: string): Promise<ControllerResponse<Object>> => {

        try {
            const user = await User.findOne({ uid })
            const competitor = await Competitors.findOne({ uid, tournament: tid })
            const tournament = await Tournament.findOne({ tournament: tid })

            if(competitor){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: "Solo te puedes registrar una vez por torneo"
                    }
                }
            }

            if(!user){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: "Registrate en la plataforma antes de inscribirte a un torneo"
                    }
                }
            }

            if(user?.metadata?.userType == 'admin'){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: "Los admin no pueden inscribirse a torneos"
                    }
                }
            }

            if(tournament?.status !== 'OPEN'){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: "Este torneo no tiene inscripciones abiertas"
                    }
                }
            }
    
            const register = new Competitors({
                uid,
                tournament: tid
            })

            await register.save()

            return {
                success: true,
                code: 200,
                res: register
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: "Error at RegisterCompetitor"
                }
            } 
        }
    }

    static GetCompetitors = async(): Promise<ControllerResponse<Object>> => {

        const competitors = await Competitors.aggregate([
            {
              '$lookup': {
                'from': 'tournaments',
                'localField': 'tournament',
                'foreignField': 'tournament',
                'as': 'tournament'
              }
            },
            {
              '$unwind': '$tournament'
            },
            {
              '$lookup': {
                'from': 'users',
                'localField': 'uid',
                'foreignField': 'uid',
                'as': 'user'
              }
            },
            {
              '$unwind': '$user'
            },
            {
              '$project': {
                '_id': 0,
                'title': '$tournament.title',
                'tournament': '$tournament.tournament',
                'description': '$tournament.description',
                'eventDate': '$tournament.eventDate',
                'location': '$tournament.location',
                'price': '$tournament.price',
                'status': '$tournament.status',
                'name': '$user.name',
                'email': '$user.email',
                'phone': '$user.phone',
                'uid': '$user.uid'
              }
            },
            {
              '$replaceRoot': { 'newRoot': '$$ROOT' }
            },
            {
              '$sort': {
                'created_at': -1
              }
            }
          ]);
          
          

        try {
            return {
                success: true,
                code: 200,
                res: competitors
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: "Ok"
                }
            } 
        }
    }

    static DeleteCompetitor = async(uid: string, tid: string): Promise<ControllerResponse<Object>> => {

        const competitor = await Competitors.findOne({ uid, tournament: tid })
        if(!competitor){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Competidor no encontrado"
                }
            }
        }

        await Competitors.findOneAndDelete({ uid, tournament: tid })

        try {
            return {
                success: true,
                code: 200,
                res: {
                    msg: "Suscripción eliminada"
                }
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: "Ok"
                }
            } 
        }
    }

}