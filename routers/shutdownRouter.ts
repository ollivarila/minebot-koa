import { MyContext, MyState } from './interactionRouter'
import { checkAuth } from '../utils/middleware'
import { HttpStatusCode } from 'axios'
import Router from 'koa-router'
import Logger from '../utils/Logger'

const shutdownRouter = new Router<MyState, MyContext>()

shutdownRouter.post('/api/server/shutdown', checkAuth, async (ctx) => {
	try {
		await ctx.server.stop()
	} catch (err) {
		Logger.error(`Error stopping server: ${(err as Error).message}`)
		ctx.status = HttpStatusCode.InternalServerError
		return
	}

	ctx.status = HttpStatusCode.NoContent
})

export default shutdownRouter.routes()
