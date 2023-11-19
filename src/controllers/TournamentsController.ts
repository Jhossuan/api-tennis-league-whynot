import Joi from "joi"
import Tournament from "../models/TournamentsSchema"
import { ControllerResponse } from "../types/app"
import { TournamentI, TournamentStatusT } from "../types/tournament"
import { ErrorMessages } from "../utils/ErrorMessages"
import User from "../models/UserSchema"

export class TournamentsControllers {

    static SchemaTournament = Joi.object({
        title: Joi.string().min(6).max(50).required(),
        description: Joi.string().min(10).max(255).required(),
        eventDate: Joi.date().required(),
        location: Joi.string().min(10).max(100).required(),
        price: Joi.string().min(1).max(10).required(),
        minParticipants: Joi.number().required(),
        maxParticipants: Joi.number().required(),
        reward: Joi.string().min(4).max(255).required()
    })

    static CreateTournament = async(uid: string, {
        title,
        description,
        eventDate,
        location,
        price,
        minParticipants,
        maxParticipants,
        reward,
        status,
        imageUrl
    }: TournamentI): Promise<ControllerResponse<Object>> => {

        
        try {
            const user = await User.findOne({ uid })
            if(user?.metadata?.userType !== 'admin'){
                return {
                    success: false,
                    code: 401,
                    error: {
                        msg: "No tienes permisos para crear torneos"
                    }
                }
            }
    
            const { error } = this.SchemaTournament.validate({
                title,
                description,
                eventDate,
                location,
                price,
                minParticipants,
                maxParticipants,
                reward
            })
    
            if(error) {
                console.log(error)
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: ErrorMessages(error.details[0].message)
                    }
                }
            }
    
            const tournament = new Tournament({
                title,
                description,
                eventDate,
                location,
                price,
                minParticipants,
                maxParticipants,
                reward,
                imageUrl,
                status
            })

            await tournament.save()

            return {
                success: true,
                code: 200,
                res: {
                    msg:"Torneo creado"
                }
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at CreateTournament'
                }
            }
        }
    }

    static GetTournaments = async(status: string): Promise<ControllerResponse<Object>> => {

        const tournaments = await Tournament.aggregate([
            {
                '$match': {
                    'status': {
                        ...(status
                            ? {
                                '$in': JSON.parse(status)
                            }
                            : {
                                '$ne': undefined
                            }
                        ),
                    }
                }
            }, {
                '$sort': {
                  'created_at': -1
                }
            }
        ])
        
        try {
            return {
                success: true,
                code: 200,
                res: tournaments
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at GetTournaments'
                }
            }
        }
    }

    static UpdateTournament = async(uid: string, tid: string, newData: TournamentI): Promise<ControllerResponse<Object>> => {

        const user = await User.findOne({ uid })
        if(user?.metadata?.userType !== 'admin'){
            return {
                success: false,
                code: 401,
                error: {
                    msg: "No tienes permisos para editar torneos"
                }
            }
        }

        if(newData.tournament){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "El id del torneo no es modificable"
                }
            }
        }

        const update: any = { $set: {  } }
        const values = Object.values(newData)
        const keys = Object.keys(newData)

        keys.forEach((item: string, i: number) => update['$set'][item] = values[i])

        if(Object.keys(update['$set']).length <= 0){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Campos a actualizar no proporcionados"
                }
            }
        }

        await Tournament.findOneAndUpdate(
            { tournament: tid },
            update,
            { new: true }
        )

        try {
            return {
                success: true,
                code: 200,
                res: "Torneo actualizado"
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at UpdateTournament'
                }
            }
        }
    }

    static DeleteTournament = async(uid: string, tid: string): Promise<ControllerResponse<Object>> => {

        const user = await User.findOne({ uid })
        if(user?.metadata?.userType !== 'admin'){
            return {
                success: false,
                code: 401,
                error: {
                    msg: "No tienes permisos para editar torneos"
                }
            }
        }

        await Tournament.findOneAndDelete({ tournament: tid })

        try {
            return {
                success: true,
                code: 200,
                res: {
                    msg: "Torneo eliminado"
                }
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at DeleteTournament'
                }
            }
        }
    }

}