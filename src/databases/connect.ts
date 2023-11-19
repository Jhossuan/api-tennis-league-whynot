import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI as string)
        console.log('¡DB Conectada correctamente!')
    } catch (error) {
        console.log('DB_ERROR', error)
        console.log('¡Error al conectar la DB!')
    }
}