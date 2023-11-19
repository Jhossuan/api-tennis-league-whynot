import { Router } from "express";
import { AuthRouter } from "./AuthRouter";
import verifyToken from "../middlewares/validate-token";
import { UserRouter } from "./UserRouter";
import { TournamentsRouter } from "./TournamentsRouter";
import { CompetitorsRouter } from "./CompetitorsRouter";

export class RootRouter {

    private static instance: RootRouter;
	private router: Router;

    constructor() {
        this.router = Router()
        this.router.use(`/${process.env.APP_VERSION}/auth`, AuthRouter.getRouter())
        this.router.use(`/${process.env.APP_VERSION}/user`, UserRouter.getRouter())
        this.router.use(`/${process.env.APP_VERSION}/tournaments`, TournamentsRouter.getRouter())
        this.router.use(`/${process.env.APP_VERSION}/competitors`, CompetitorsRouter.getRouter())
    }

    static getRouter(): Router {
		if (!RootRouter.instance) {
			RootRouter.instance = new RootRouter();
		}
		return RootRouter.instance.router;
	}

}