import createRouter from '../utils/createRouter'

const helloRouter = createRouter()

helloRouter.get('/hello', async (ctx) => {
	ctx.reply('Hello World!', ctx)
})

export default helloRouter.routes()
