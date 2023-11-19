import { Schema, model } from "mongoose";
import { CompetitorsI } from "../types/tournament";

const CompetitorsSchema = new Schema({
    uid: {
        type: String,
        require: true
    },
    tournament: {
        type: String,
        require: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
})

const Competitors = model<CompetitorsI>('Competitors', CompetitorsSchema)
export default Competitors;