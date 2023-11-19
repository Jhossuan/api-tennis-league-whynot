import User from "../models/UserSchema";
import { ControllerResponse } from "../types/app";

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
                'phone': 1, 
                'metadata': 1, 
                'uid': 1, 
                'created_at': 1
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

}