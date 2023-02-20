import { MyContext } from './interactionRouter'
import Router from 'koa-router'

const helloRouter: Router = new Router()

// @ts-ignore
helloRouter.get('/hello', async (ctx: MyContext) => {
	ctx.reply('Hello World!', ctx)
})

export default helloRouter.routes()
