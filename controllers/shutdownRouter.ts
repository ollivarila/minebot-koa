import Router from '@koa/router'
import { Context } from 'koa'

const shutdownRouter = new Router()

shutdownRouter.post('/api/server/shutdown', async (ctx: Context) => {
  ctx.body = {
    message: 'shutting down',
  }
})

export default shutdownRouter.routes()
