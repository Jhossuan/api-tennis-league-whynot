import { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'

async function verifyToken(req: any, res: Response, next: NextFunction){

    if(!req.headers['authorization']){
        return res.status(401).send({ msg: "Acceso denegado" })
    }
    const token = req.headers['authorization'].split(' ')[1].trim()

    if(!token){
        return res.status(401).send({ msg: "Acceso denegado" })
    }

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET as string);
        console.log('VERIFIED', verified)
        req.user = verified;
        next();
    } catch (error) {
        console.log('error-jwt', error)
        return res.status(401).send(error)
    }
}

export default verifyToken