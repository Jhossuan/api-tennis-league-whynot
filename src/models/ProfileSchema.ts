import { Schema, model } from "mongoose";

export interface ProfileI {
    uid: string
    gender: string
    birthdate: Date
    phone: string
    skill_level: string
    municipality: string
    weekly_availability: string
    sport: string
}

const ProfileSchema = new Schema({
    uid: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        require: true
    },
    birthdate: {
        type: Date,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    skill_level: {
        type: String,
        require: true
    },
    municipality: {
        type: String,
        require: true
    },
    weekly_availability: {
        type: String,
        require: true
    },
    sport: {
        type: String,
        require: true
    },
})

const Profile = model<ProfileI>('Profile', ProfileSchema)
export default Profile;