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
import Profile, { ProfileI } from "../models/ProfileSchema";

export class AuthController {

    static SchemaRegister = Joi.object({
        name: Joi.string().min(4).max(255).required(),
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(1024).required(),
        userType: Joi.string().required()
    })

    static SchemaProfile = Joi.object({
        uid: Joi.string().min(4).max(20).required(),
        gender: Joi.required(),
        birthdate: Joi.date().required(),
        phone: Joi.string().min(4).max(13).required(),
        skill_level: Joi.string().min(3).max(30).required(),
        municipality: Joi.string().min(4).max(45).required(),
        weekly_availability: Joi.string().min(4).max(45).required(),
        sport: Joi.string().min(4).max(30).required(),
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
        userType: 'admin' | 'regular'
    ): Promise<ControllerResponse<Object>> => {
        console.log('entra')
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
    
            const { error } = this.SchemaRegister.validate({ name, email, password, userType })
    
            if(error) {
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: ErrorMessages(error.details[0].message)
                    }
                }
            }
    
            const metadata: MetadataI = {
                userType: userType,
                identity_verified: false,
            }
    
            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, salt)
    
            const user = new User({
                name,
                email,
                password: hashPassword,
                metadata
            })

            const response = await user.save()

            return {
                success: true,
                code: 200,
                res: response
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

    static CompleteProfile = async (data: ProfileI): Promise<ControllerResponse<Object>> => {

        const { uid, gender, birthdate, phone, skill_level, municipality, weekly_availability, sport } = data

        const profile = await Profile.findOne({ uid })
        if(profile){
            return {
                success: false,
                code: 404,
                error: {
                    msg: 'Este usuario ya tiene un perfil'
                }
            }
        }

        const { error } = this.SchemaProfile.validate(data)
        
        if(error) {
            return {
                success: false,
                code: 404,
                error: {
                    msg: ErrorMessages(error.details[0].message)
                }
            }
        }

        const newProfile = new Profile({
            uid,
            gender,
            birthdate,
            phone,
            skill_level,
            municipality,
            weekly_availability,
            sport
        })

        await newProfile.save()

        try {
            return {
                success: true,
                code: 200,
                res: {
                    msg: 'Perfil creado correctamente'
                }
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at CompleteProfile'
                }
            }
        }
    }

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
                uid: user.uid,
                name: user.name,
                email: user.email,
                id: user._id,
                type: user.metadata?.userType,
                exp: this.ExpirationDate(12)
            }, process.env.TOKEN_SECRET as string)

            return {
                success: true,
                code: 200,
                res: {
                    msg: "Sesión iniciada correctamente",
                    token,
                    type: user.metadata?.userType
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
        type: 'repassword' | 'identity_verified'
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

            const profile = await Profile.findOne({ uid: user?.uid })

            if(!profile){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: 'Completa tu perfil, antes de verificar tu cuenta'
                    }
                }
            }

            const now = getNow()
            const expireIn = expireInEspecificMinutes(5)

            const code = this.VerificationNumber()
            console.log('CODIGO', code)
            // Con este estamos encriptando el codigo de verificacion, asi lo guardamos de manera segura en la DB
            const salt = await bcrypt.genSalt(10)
            const hashCode = await bcrypt.hash(code, salt)

            console.log('now', now)
            console.log('expireIn', user.metadata?.expireIn)

            if(new Date(now) < new Date(user.metadata?.expireIn)){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: `Genera nuevamente ${moment(user.metadata?.expireIn).fromNow()}`
                    }
                }
            }

            if(type === 'identity_verified'){
                try {
                    if(user.metadata?.identity_verified){
                        return {
                            success: false,
                            code: 404,
                            error: {
                                msg: 'Este usuario ya esta verificado'
                            }
                        }
                    }

                    SendMessage(profile.phone, code)

                    await User.findOneAndUpdate(
                        { email },
                        {
                            "metadata.code": hashCode,
                            "metadata.expireIn": expireIn
                        }
                    )
                    return {
                        success: true,
                        code: 200,
                        res: {
                            msg: "Código de verificación enviado",
                            uid: user.uid
                        }
                    }
                } catch (error) {
                    return {
                        success: false,
                        code: 404,
                        error: {
                            msg: "Error at identity_verified"
                        }
                    }
                }
            }

            if(!user.metadata?.identity_verified){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: "Verifica tu cuenta"
                    }
                }
            }
    
            if(user.metadata?.repassword){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: 'Usuario ya validado'
                    }
                }
            }
    
            SendMessage(profile.phone, code)

            await User.findOneAndUpdate(
                { email },
                { 
                    "metadata.code": hashCode,
                    "metadata.expireIn": expireIn
                }
            )

            return {
                success: true,
                code: 200,
                res: {
                    msg: 'Código de recuperación enviado',
                    uid: user.uid
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
        code: string,
        type: 'repassword' | 'identity_verified'
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

            if(!user.metadata?.code){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: 'Este usuario no tiene código de validación'
                    }
                }
            }

            const now = getNow()
            if(new Date(now) > new Date(user.metadata.expireIn)){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: "El código ha expirado, vuelve a generar otro"
                    }
                }
            }
            
            const hashCode = await bcrypt.compare(code, user.metadata.code)
            console.log('code', code)
            console.log('hashCode', hashCode)
            if(!hashCode){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: "El código ingresado es el incorrecto"
                    }
                }
            }

            let update;
            if(type === 'repassword'){
                update = { "metadata.repassword": true }
            }
            if(type === 'identity_verified'){
                update = {
                    $unset: {
                        "metadata.code": 1,
                        "metadata.expireIn": 1,
                    },
                    $set: { "metadata.identity_verified": true }
                }
            }

            await User.findOneAndUpdate(
                { email },
                update
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

            if(!user.metadata?.repassword){
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

    static DecodedToken = async (token: string): Promise<ControllerResponse<Object>> => {
        try {

            if(!token){
                return {
                    success: false,
                    code: 404,
                    error: {
                        msg: 'Token requerido'
                    }
                }
            }

            const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string)

            return {
                success: true,
                code: 200,
                res: decoded
            }
        } catch (error) {
            console.log('errorJWT', error)
            return {
                success: false,
                code: 500,
                error: {
                    msg: 'Error at DecodedToken'
                }
            }
        }
    }

}
