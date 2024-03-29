import { Router, Response, Request } from "express";
import { UserController } from "../controllers/UserController";
import verifyToken from "../middlewares/validate-token";

export class UserRouter {
    private static instance: UserRouter
    private router: Router;

    private constructor() {
        this.router = Router();
        this.router.use(verifyToken)
        this.router.get('/all-users', this.GetAllUsers)
        this.router.get('/all-data', this.GetAllData)
        this.router.get('/delete', this.DeleteUser)
        this.router.patch('/update', this.UpdateUser)
    }

    static getRouter(): Router {
        if (!UserRouter.instance) {
			UserRouter.instance = new UserRouter();
		}
		return UserRouter.instance.router;
    }

    private GetAllUsers = async(req: Request, res: Response) => {
        try {
            const { type } = req.query
            const response  = await UserController.GetAllUsers(type as string)

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private DeleteUser = async(req: Request, res: Response) => {
        try {
            const { uid } = req.query
            const response  = await UserController.DeleteUser(uid as string)

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private UpdateUser = async(req: Request, res: Response) => {
        try {
            const { uid, newData } = req.body
            const response  = await UserController.UpdateUser(uid, newData)

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private GetAllData = async(req: Request, res: Response) => {
        try {
            const response  = await UserController.GetAllData()

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

}