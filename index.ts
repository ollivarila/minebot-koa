import Koa, { Context, DefaultContext, DefaultState } from 'koa'
import dotenv from 'dotenv'
import interactionRouter from './controllers/interactionRouter'
import bodyParser from 'koa-bodyparser'
import { reply } from './utils/reply'
import shutdownRouter from './controllers/shutdownRouter'
import helloRouter from './controllers/helloRouter'
import ServerController from './controllers/ServerController'

dotenv.config()

const app: Koa<DefaultState, DefaultContext> = new Koa()

const hostname: string | undefined = process.env.HOSTNAME

if (!hostname) {
	throw new Error('HOSTNAME is not defined')
}

app.context.reply = reply
app.context.server = new ServerController(hostname)
app.use(bodyParser())

app.use(interactionRouter)

// app.use(shutdownRouter)

app.use(helloRouter)

const port: string | number = process.env.PORT || 8080

app.listen(port, (): void => {
	console.log('Server listening on ' + port)
})
