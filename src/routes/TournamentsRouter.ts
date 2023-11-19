import { Router, Response, Request } from "express";
import { TournamentsControllers } from "../controllers/TournamentsController";
import { TournamentI, TournamentStatusT } from "../types/tournament";
import verifyToken from "../middlewares/validate-token";

export class TournamentsRouter {
    private static instance: TournamentsRouter
    private router: Router;

    private constructor() {
        this.router = Router();
        this.router.get('/get', this.GetTournaments)
        this.router.use(verifyToken)
        this.router.post('/create', this.CreateTournament)
        this.router.patch('/update', this.UpdateTournament)
        this.router.delete('/delete', this.DeleteTournament)
    }

    static getRouter(): Router {
        if (!TournamentsRouter.instance) {
			TournamentsRouter.instance = new TournamentsRouter();
		}
		return TournamentsRouter.instance.router;
    }

    private CreateTournament = async(req: Request, res: Response) => {
        try {
            const response = await TournamentsControllers.CreateTournament(req.body.uid, req.body as TournamentI)
            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private GetTournaments = async(req: Request, res: Response) => {
        try {
            const { status } = req.query
            const response = await TournamentsControllers.GetTournaments(status as string)
            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    
    private UpdateTournament = async(req: Request, res: Response) => {
        try {
            const { uid, tid, newData } = req.body
            const response = await TournamentsControllers.UpdateTournament(uid, tid, newData)
            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

    private DeleteTournament = async(req: Request, res: Response) => {
        try {
            const { uid, tid } = req.body
            const response = await TournamentsControllers.DeleteTournament(uid, tid)
            if(!response.success){
                return res.status(response.code).send(response.error)
            }
            return res.status(response.code).send(response.res)
        } catch (error: any) {
            return res.status(500).send(error.message)
        }
    }

}