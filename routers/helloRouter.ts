import { MBContext, MBState } from './interactionRouter'
import Router from 'koa-router'

const helloRouter = new Router<MBState, MBContext>()

helloRouter.get('/hello', async (ctx) => {
	ctx.reply('Hello World!', ctx)
})

export default helloRouter.routes()
