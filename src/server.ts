import { App } from "./app";
import { connectDb } from "./databases/connect";

const startApp = async() => {
    const app = App.getInstance()
    const port = process.env.PORT || 5000

    connectDb()
    console.log('App Version', process.env.APP_VERSION)

    app.listen(port, () => { console.log(`Server running in port ${port}`) })
}

startApp()