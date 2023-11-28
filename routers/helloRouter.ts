import { MyContext, MyState } from './interactionRouter'
import Router from 'koa-router'

const helloRouter = new Router<MyState, MyContext>()

helloRouter.get('/hello', async (ctx) => {
	ctx.reply('Hello World!', ctx)
})

export default helloRouter.routes()
