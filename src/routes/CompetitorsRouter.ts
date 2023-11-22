import { Router, Response, Request } from "express";
import { CompetitorsController } from "../controllers/CompetitorsController";
import verifyToken from "../middlewares/validate-token";

export class CompetitorsRouter {
    private static instance: CompetitorsRouter
    private router: Router;

    private constructor() {
        this.router = Router();
        this.router.use(verifyToken)
        this.router.post('/register', this.RegisterCompetitor)
        this.router.get('/get', this.GetCompetitors)
        this.router.post('/unsuscribe', this.DeleteCompetitor)
    }

    static getRouter(): Router {
        if (!CompetitorsRouter.instance) {
			CompetitorsRouter.instance = new CompetitorsRouter();
		}
		return CompetitorsRouter.instance.router;
    }

    private RegisterCompetitor = async(req: Request, res: Response) => {
        try {
            const { uid, tid } = req.body
            const response  = await CompetitorsController.RegisterCompetitor(uid as string, tid as string)

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private GetCompetitors = async(req: Request, res: Response) => {
        try {
            const response  = await CompetitorsController.GetCompetitors()

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private DeleteCompetitor = async(req: Request, res: Response) => {
        try {
            const { uid, tid } = req.body
            const response  = await CompetitorsController.DeleteCompetitor(uid, tid)

            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

}