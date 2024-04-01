require("dotenv").config()
const express = require("express")
const cors = require("cors")
const router = require("./routers/index.js")
const errorHandler = require("./middlewares/errorHandlerMiddleware.js")
const cookieParser = require("cookie-parser")

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || "localhost"

const sequelize = require("./db/db.js")

const corsOption = {
	origin: [process.env.CLIENT_URL], //, process.env.API_URL],
	// allowedHeaders: [
	// 	"Origin",
	// 	"Content",
	// 	"Accept",
	// 	"Content-Type",
	// 	"Credentials",
	// ],
	credentials: true,
	// optionSuccessStatus:200,
}

const app = express();

// app.use( express.raw() )
app.use( express.json() );
app.use( cors( corsOption ) );
app.use( cookieParser( process.env.COOKIE_KEY ) )

app.use( "/api", router )

app.use( errorHandler )

const run = async () => {
	try {

		await sequelize.authenticate();
		await sequelize.sync(
			// { force: true }
		)
		
		app.listen(
			PORT, HOST,
			() => console.log(`server work at ${HOST}:${PORT}`)
		) 

	}
	catch (e) {
		console.log( e )
	}
}

run();