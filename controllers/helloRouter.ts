import Router from '@koa/router'
import { MyContext } from './interactionRouter'

const helloRouter: Router = new Router()

helloRouter.get('/hello', async (ctx: MyContext) => {
	ctx.reply('Hello World!', ctx)
})

export default helloRouter.routes()
