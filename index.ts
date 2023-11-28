import Koa, { DefaultContext, DefaultState } from 'koa'
import interactionRouter from './routers/interactionRouter'
import bodyParser from 'koa-bodyparser'
import { reply } from './utils/reply'
import shutdownRouter from './routers/shutdownRouter'
import helloRouter from './routers/helloRouter'
import ServerController from './controllers/ServerController'
import logger from 'koa-logger'
import EmbedFactory from './utils/EmbedFactory'
import Logger from './utils/Logger'
import config from './config'

const app: Koa<DefaultState, DefaultContext> = new Koa()

app.context.reply = reply
app.context.server = new ServerController()
app.context.embedFactory = new EmbedFactory()

app.use(logger())

app.use(bodyParser())

app.use(interactionRouter)

app.use(shutdownRouter)

app.use(helloRouter)

const port: string = config.PORT

app.listen(port, (): void => {
	Logger.log('Server listening on ' + port)
})
