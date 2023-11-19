import Joi from "joi";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import moment from 'moment'

import User from "../models/UserSchema";
import { ControllerResponse } from "../types/app";
import { MetadataI } from "../types/user";
import { ErrorMessages } from "../utils/ErrorMessages";
import { SendMessage } from "../utils/Twilio";
import { expireInEspecificMinutes, getNow } from "../utils/DateTools";

export class AuthController {

    static SchemaRegister = Joi.object({
        name: Joi.string().min(4).max(255).required(),
        email: Joi.string().min(6).max(255).required().email(),
        phone: Joi.string().min(10).max(13).required(),
        password: Joi.string().min(6).max(1024).required()
    })

    static SchemaLogin = Joi.object({
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(1024).required(),
    })

    static SchemaChangePassword = Joi.object({
        email: Joi.string().min(6).max(255).required().email(),
        phone: Joi.string().min(10).max(12).required(),
    })

    static ExpirationDate = (hours: number) => {
        return Math.floor(Date.now() / 1000) + (hours * 3200) // 3200 es igual a 60 * 60 ( 3200 equivale a 1hr en segundos )
    }

    static VerificationNumber = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    static Register = async (
        name: string,
        email: string,
        password: string,
        phone: string,
        userType: 'admin' | 'regular'
    ): Promise<ControllerResponse<Object>> => {
        try {
            const emailToVerify = await User.findOne({ email })
            if(emailToVerify){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: "Email ya registrado"
                    }
                }
            }
    
            const { error } = this.SchemaRegister.validate({ name, email, password, phone })
    
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
    
            if(!userType){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: "El tipo de usuario es requerido"
                    }
                }
            }
    
            const metadata: MetadataI = {
                userType: userType
            }
    
            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, salt)
    
            const user = new User({
                name,
                email,
                phone,
                password: hashPassword,
                metadata
            })

            await user.save()

            return {
                success: true,
                code: 200,
                res: {
                    msg: "Registro exitoso"
                }
            }
        } catch (error) {
            console.log('error', error)
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at registerUser'
                }
            }
        }
    };

    static Login = async (
        email: string,
        password: string
    ): Promise<ControllerResponse<Object>> => {
        try {
            const { error } = this.SchemaLogin.validate({ email, password })
            if(error) {
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: ErrorMessages(error.details[0].message)
                    }
                }
            }

            const user = await User.findOne({ email })
            if(!user) {
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: 'Usuario no encontrado'
                    }
                }
            }

            const hashPassword = await bcrypt.compare(password, user.password);
            if(!hashPassword) {
                return {
                    success: false,
                    code: 400,
                    error: {
                        msg: 'Contraseña incorrecta'
                    }
                }
            }

            const token = jwt.sign({
                name: user.name,
                email: user.email,
                id: user._id,
                exp: this.ExpirationDate(12)
            }, process.env.TOKEN_SECRET as string)

            return {
                success: true,
                code: 200,
                res: {
                    msg: "Sesión iniciada correctamente",
                    token
                }
            }
        } catch (error) {
            console.log('error', error)
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at Login'
                }
            }
        }
    }

    static SendCode = async (
        email: string,
    ): Promise<ControllerResponse<Object>> => {

        try {
            const user = await User.findOne({ email })
            if(!user){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: 'Usuario no encontrado'
                    }
                }
            }

            const now = getNow()
            const expireIn = expireInEspecificMinutes(5)

            console.log('now', now)
            console.log('expireIn', user.metadata.expireIn)

            if(new Date(now) < new Date(user.metadata.expireIn)){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: `Genera nuevamente ${moment(user.metadata.expireIn).fromNow()}`
                    }
                }
            }

            if(user.metadata.repassword){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: 'Usuario ya validado'
                    }
                }
            }

            const code = this.VerificationNumber()
            SendMessage(user.phone, code)
    
            await User.findOneAndUpdate(
                { email },
                { "metadata.code": code, "metadata.expireIn": expireIn }
            )

            return {
                success: true,
                code: 200,
                res: {
                    msg: 'Código enviado'
                }
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at ChangePassword'
                }
            }
        }
    }

    static ValidateCode = async (
        email: string,
        code: string
    ): Promise<ControllerResponse<Object>> => {
        try {
            const user = await User.findOne({ email })
            if(!user){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: 'Usuario no encontrado'
                    }
                }
            }

            if(!user.metadata.code){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: 'Este usuario no tiene código de validación'
                    }
                }
            }

            if(user.metadata.code !== code){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: "El código ingresado es el incorrecto"
                    }
                }
            }

            await User.findOneAndUpdate(
                { email },
                { "metadata.repassword": true }
            )

            return {
                success: true,
                code: 200,
                res: {
                    msg: 'Usuario verificado'
                }
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at ValidateCode'
                }
            }
        }
    }

    static NewPassword = async (
        email: string,
        password: string
    ): Promise<ControllerResponse<Object>> => {

        try {

            const user = await User.findOne({ email })
            if(!user){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: 'Usuario no encontrado'
                    }
                }
            }

            if(!user.metadata.repassword){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: 'El usuario no esta validado'
                    }
                }
            }

            const salt = await bcrypt.genSalt(10)
            const newPassword = await bcrypt.hash(password, salt)

            await User.findOneAndUpdate(
                { email },
                {
                    $unset: {
                        "metadata.code": 1,
                        "metadata.repassword": 1,
                        "metadata.expireIn": 1,
                    },
                    $set: { "password": newPassword }
                }
            )

            return {
                success: true,
                code: 200,
                res: {
                    msg: 'Contraseña restablecida'
                }
            }
            
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at NewPassword'
                }
            }
        }

    }

}
