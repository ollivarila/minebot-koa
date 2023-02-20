import { MyContext } from './interactionRouter'
import { checkAuth } from '../utils/middleware'
import { HttpStatusCode } from 'axios'
import Router from 'koa-router'

const shutdownRouter = new Router()

shutdownRouter.post('/api/server/shutdown', checkAuth, async (ctx: MyContext) => {
	try {
		await ctx.server.stop()
	} catch (error: any) {
		ctx.status = HttpStatusCode.InternalServerError
		return
	}

	ctx.status = HttpStatusCode.NoContent
})

export default shutdownRouter.routes()
