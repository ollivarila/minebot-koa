import Router from '@koa/router'
import { verifyDiscordRequest } from '../utils/middleware'
import dotenv from 'dotenv'
import { Context } from 'koa'
import { InteractionResponseType, InteractionType, User } from 'discord.js'
import { ReplyFunction } from '../utils/reply'

interface MyContext extends Context {
  reply: ReplyFunction
}

type UserId = string

const authorizedUsers: Array<UserId> = [
  '188329879861723136',
  '209654420999241728',
  '208247677585063936',
  '430991331880337408',
  '182935119625977867',
  '405711174668124160',
]

dotenv.config()

const interactionRouter = new Router()

// @ts-ignore
interactionRouter.use(verifyDiscordRequest)

interactionRouter.post('/api/interactions', async (ctx: MyContext): Promise<void> => {
  // @ts-expect-error
  const type: number = ctx.request.body.type

  if (type === InteractionType.Ping) {
    ctx.body = {
      type: InteractionResponseType.Pong,
    }
  }

  if (type === InteractionType.ApplicationCommand) {
    await handleInteractions(ctx)
  }
})

async function handleInteractions(ctx: MyContext) {
  // @ts-expect-error
  const command = ctx.request.body.data.name

  switch (command) {
    case 'serverup':
      return await handleServerUp(ctx)
    case 'serverdown':
      return await handleServerDown(ctx)
    case 'getip':
      return await handleGetIp(ctx)
    case 'status':
      return await handleGetStatus(ctx)

    default:
      break
  }
}

function handleServerUp(ctx: MyContext) {}

function handleServerDown(ctx: MyContext) {
  throw new Error('Function not implemented.')
}

function handleGetIp(ctx: MyContext) {
  throw new Error('Function not implemented.')
}

function handleGetStatus(ctx: MyContext) {
  throw new Error('Function not implemented.')
}

export default interactionRouter.routes()
