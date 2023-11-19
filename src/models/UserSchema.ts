import { Schema, model } from "mongoose";
import ShortUniqueId from "short-unique-id";
import { UserSchemaI } from "../types/user";

const uid = new ShortUniqueId({ length:20 });

const UserSchema = new Schema({
    uid: {
        type: String,
        require: true,
        unique: true,
        default: () => uid.rnd(),
    },
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    phone: {
        type: String,
        require: true,
    },
    metadata: {
        type: Object,
        require: true,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
})

const User = model<UserSchemaI>('User', UserSchema)
export default User;