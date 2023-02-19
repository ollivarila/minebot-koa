import Router from '@koa/router'
import { MyContext } from './interactionRouter'
import { tokenParser } from '../utils/middleware'

const shutdownRouter = new Router()


shutdownRouter.use(tokenParser)

shutdownRouter.post('/api/server/shutdown', async (ctx: MyContext) => {
  

})

export default shutdownRouter.routes()
