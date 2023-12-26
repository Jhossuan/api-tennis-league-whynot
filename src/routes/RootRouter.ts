import { Router } from "express";
import { AuthRouter } from "./AuthRouter";
import { UserRouter } from "./UserRouter";
import { TournamentsRouter } from "./TournamentsRouter";
import { CompetitorsRouter } from "./CompetitorsRouter";

export class RootRouter {

    private static instance: RootRouter;
	private router: Router;

    constructor() {
        this.router = Router()
        this.router.use(`/v1/auth`, AuthRouter.getRouter())
        this.router.use(`/v1/user`, UserRouter.getRouter())
        this.router.use(`/v1/tournaments`, TournamentsRouter.getRouter())
        this.router.use(`/v1/competitors`, CompetitorsRouter.getRouter())
    }

    static getRouter(): Router {
		if (!RootRouter.instance) {
			RootRouter.instance = new RootRouter();
		}
		return RootRouter.instance.router;
	}

}