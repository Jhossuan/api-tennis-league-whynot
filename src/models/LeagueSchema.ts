import { Schema } from "mongoose";
import ShortUniqueId from "short-unique-id";

const lid = new ShortUniqueId({ length:20 });

export interface LevelsInterface {
    name: string, level: string, description: string
}

const LeagueSchema = new Schema({
    league: {
        type: String,
        require: true,
        unique: true,
        default: () => lid.rnd(),
    },
    title: {
        type: String,
        require: true,
    },
    sport: {
        type: String,
        require: true,
    },
    duration: {
        type: String,
        require: true,
    },
    type: {
        type: String,
        require: true,
    },
    doubles: {
        type: Boolean,
        require: true,
    },
    format: {
        type: String,
        require: true,
    },
    levels: {
        type: Object,
        require: true,
    },
})