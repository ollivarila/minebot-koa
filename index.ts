import Koa, { Context, DefaultContext, DefaultState } from 'koa'
import dotenv from 'dotenv'
import interactionRouter from './controllers/interactionRouter'
import bodyParser from 'koa-bodyparser'
import { reply } from './utils/reply'
import shutdownRouter from './controllers/shutdownRouter'

dotenv.config()

const app: Koa<DefaultState, DefaultContext> = new Koa()

app.context.reply = reply

app.use(bodyParser())

app.use(interactionRouter)

app.use(shutdownRouter)

const port: string | number = process.env.PORT || 8080

app.listen(port, (): void => {
  console.log('Server listening on ' + port)
})
