import Competitors from "../models/CompetitorsSchema";
import Profile from "../models/ProfileSchema";
import Tournament from "../models/TournamentsSchema";
import User from "../models/UserSchema";
import { ControllerResponse } from "../types/app";
import { UserSchemaI } from "../types/user";

export class UserController {

    static GetAllUsers = async(type: string): Promise<ControllerResponse<Object>> => {

        const users = await User.aggregate([
            {
                '$match': {
                    'metadata.userType': type ?? {
                        "$in": ["admin", "regular"]
                    }
                }
            },
            {
              '$project': {
                'name': 1, 
                'email': 1, 
                'metadata': 1, 
                'uid': 1, 
                'created_at': 1
              }
            },
            {
                '$lookup': {
                  'from': "profiles",
                  'localField': "uid",
                  'foreignField': "uid",
                  'as': "profile",
                }
            },{
                '$unwind': '$profile'
            },
            {
              '$sort': {
                'created_at': -1,
              }
            },
            {
              '$sort': {
                'metadata.userType': 1
              }
            }
        ])

        try {
            return {
                success: true,
                code: 200,
                res: users
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at GetAllUsers'
                }
            }
        }
    }

    static UpdateUser = async(uid: string, newData: UserSchemaI): Promise<ControllerResponse<Object>> => {

        const user = await User.findOne({ uid })
        if(!user){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Usuario no encontrado"
                }
            }
        }

        if(newData.metadata || newData.uid || newData.password){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "metadata, uid y password no son editables"
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

        await User.findOneAndUpdate(
            { uid },
            update,
            { new: true }
        )

        try {
            return {
                success: true,
                code: 200,
                res: {
                    msg: "Usuario actualizado"
                }
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: "Error at UpdateUser"
                }
            }
        }
    }

    static DeleteUser = async(uid: string): Promise<ControllerResponse<Object>> => {

        const user = await User.findOne({ uid })
        if(!user){
            return {
                success: false,
                code: 404,
                error: {
                    msg: "Usuario no encontrado"
                }
            }
        }

        await User.findOneAndDelete({ uid })
        await Competitors.deleteMany({ uid })
        await Profile.findOneAndDelete({ uid })

        try {
            return {
                success: true,
                code: 200,
                res: {
                    msg: "Usuario eliminado"
                }
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: "Error at DeleteUser"
                }
            }
        }
    }

    static GetAllData = async(): Promise<ControllerResponse<Object>> => {

        const qtyCompetitors = await Competitors.countDocuments()
        const qtyUsers = await User.countDocuments()
        const qtyTournaments = await Tournament.countDocuments()
        const statusTournaments = await Tournament.aggregate([
            {
              '$group': {
                '_id': '$status', 
                'count': {
                  '$sum': 1
                }
              }
            }
          ])

        try {
            return {
                success: true,
                code: 200,
                res: {
                    qtyCompetitors,
                    qtyUsers,
                    qtyTournaments,
                    statusTournaments
                }
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg:'GetAllData'
                }
            }
        }
    }

}