import { checkAuth } from '../utils/middleware'
import { HttpStatusCode } from 'axios'
import Logger from '../utils/Logger'
import createRouter from '../utils/createRouter'

const shutdownRouter = createRouter()

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
