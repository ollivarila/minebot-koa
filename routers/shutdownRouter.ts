import Router from '@koa/router'
import { MyContext } from './interactionRouter'
import { checkAuth } from '../utils/middleware'
import { HttpStatusCode } from 'axios'

const shutdownRouter = new Router()

shutdownRouter.post('/api/server/shutdown', checkAuth, async (ctx: MyContext) => {
	const response: string = await ctx.server.stop()

	ctx.assert(response === 'Stopping server...', HttpStatusCode.InternalServerError)

	ctx.status = HttpStatusCode.NoContent
})

export default shutdownRouter.routes()
