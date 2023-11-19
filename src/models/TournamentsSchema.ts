import { Schema, model } from "mongoose";
import ShortUniqueId from "short-unique-id";
import { TournamentI } from "../types/tournament";

const tid = new ShortUniqueId({ length:20 });

const TournamentSchema = new Schema({
    tournament: {
        type: String,
        require: true,
        unique: true,
        default: () => tid.rnd(),
    },
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    eventDate: {
        type: Date,
        require: true,
    },
    location: {
        type: String,
        require: true,
    },
    price: {
        type: String,
        require: true,
    },
    minParticipants: {
        type: Number,
        require: true,
    },
    maxParticipants: {
        type: Number,
        require: true,
    },
    reward: {
        type: String,
        require: true,
    },
    imageUrl: {
        type: String,
        require: true,
    },
    status: {
        type: Array,
        require: true,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
})

const Tournament = model<TournamentI>('Tournaments', TournamentSchema)
export default Tournament;