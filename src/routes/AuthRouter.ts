import { Router, Response, Request } from "express";
import { AuthController } from "../controllers/AuthController";

export class AuthRouter {
    private static instance: AuthRouter
    private router: Router;

    private constructor() {
        this.router = Router();
        this.router.post('/register', this.RegisterUser)
        this.router.post('/profile', this.CompleteProfile)
        this.router.post('/login', this.Login)
        this.router.post('/validation-code', this.SendCode)
        this.router.post('/validate-code', this.ValidateCode)
        this.router.patch('/repassword', this.NewPassword)
        this.router.get('/decoded', this.DecodedToken)
    }

    static getRouter(): Router {
        if (!AuthRouter.instance) {
			AuthRouter.instance = new AuthRouter();
		}
		return AuthRouter.instance.router;
    }

    private RegisterUser = async(req: Request, res: Response) => {
        try {
            const { name, email, password, userType } = req.body
            const response = await AuthController.Register(name, email, password, userType)
            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private CompleteProfile = async(req: Request, res: Response) => {
        try {
            const response = await AuthController.CompleteProfile(req.body)
            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private Login = async(req: Request, res: Response) => {
        try {
            const { email, password } = req.body

            const response  = await AuthController.Login(email, password)

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private SendCode = async(req: Request, res: Response) => {
        try {
            const { email, type } = req.body

            const response  = await AuthController.SendCode(email, type)

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private ValidateCode = async(req: Request, res: Response) => {
        try {
            const { email, code, type } = req.body

            const response  = await AuthController.ValidateCode(email, code, type)

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private NewPassword = async(req: Request, res: Response) => {
        try {
            const { email, password } = req.body

            const response  = await AuthController.NewPassword(email, password)

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private DecodedToken = async(req: Request, res: Response) => {
        try {
            const { token } = req.query

            const response  = await AuthController.DecodedToken(token as string)

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

}