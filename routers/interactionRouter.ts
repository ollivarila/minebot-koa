import { channelIdParser, userParser, verifyDiscordRequest } from '../utils/middleware'
import { InteractionResponseType, InteractionType } from 'discord.js'
import { sendMessageToChannel } from '../utils/discordRequests'
import { DiscordId, MBContext } from '../interfaces'
import createRouter from '../utils/createRouter'
import Logger from '../utils/Logger'

const authorizedUsers: DiscordId[] = [
  '188329879861723136',
  '253526242077310976',
  '430991331880337408',
]

const interactionRouter = createRouter()

interactionRouter.post(
  '/api/interactions',
  verifyDiscordRequest,
  userParser,
  channelIdParser,
  async (ctx): Promise<void> => {
    // @ts-expect-error
    const type: number = ctx.request.body.type

    if (type === InteractionType.Ping) {
      ctx.body = {
        type: InteractionResponseType.Pong,
      }
      return
    }

    if (type === InteractionType.ApplicationCommand) {
      await handleInteractions(ctx)
      return
    }
  },
)

const commands: Record<string, (ctx: MBContext) => Promise<void>> = {
  serverup: handleServerUp,
  serverdown: handleServerDown,
  getip: handleGetIp,
  status: handleGetStatus,
}

async function handleInteractions(ctx: MBContext): Promise<void> {
  // @ts-expect-error
  const command = ctx.request.body.data.name
  const handler = commands[command]
  await handler(ctx)
}

async function handleServerUp(ctx: MBContext): Promise<void> {
  if (!authorized(ctx.state.discordId)) {
    Logger.log("User isn't authorized to start server")
    ctx.reply('You are not authorized!', ctx)
    return
  }

  Logger.log('Server startup requested')
  ctx.reply('Starting server...', ctx)
  startAndMonitor(ctx)
  Logger.log('Server started successfully!')
}

async function startAndMonitor(ctx: MBContext) {
  try {
    await ctx.server.start()
  } catch (error: any) {
    Logger.error('Error starting server: ', error.message)
    await sendMessageToChannel(ctx.embedFactory.errorEmbed(error.message), ctx.state.channelId)
    return
  }
  await sendMessageToChannel(
    ctx.embedFactory.startedUpEmbed(ctx.server.getIp()),
    ctx.state.channelId,
  )
}

async function handleServerDown(ctx: MBContext): Promise<void> {
  if (!authorized(ctx.state.discordId)) {
    ctx.reply('You are not authorized!', ctx)
    return
  }

  try {
    await ctx.server.stop()
  } catch (error: any) {
    ctx.reply(ctx.embedFactory.errorEmbed(error.message), ctx)
    return
  }
  ctx.reply('Server stopped!', ctx)
}

async function handleGetIp(ctx: MBContext): Promise<void> {
  try {
    const ip: string = ctx.server.getIp()
    ctx.reply(ctx.embedFactory.ipEmbed(ip), ctx)
  } catch (error: any) {
    ctx.reply(ctx.embedFactory.errorEmbed(error.message), ctx)
  }
}

async function handleGetStatus(ctx: MBContext): Promise<void> {
  try {
    const status: string = await ctx.server.status()
    ctx.reply(ctx.embedFactory.statusEmbed(status, ctx.server.getIp()), ctx)
  } catch (error: any) {
    ctx.reply(ctx.embedFactory.errorEmbed(error.message), ctx)
  }
}

function authorized(discordId: DiscordId): boolean {
  return authorizedUsers.includes(discordId)
}

export default interactionRouter.routes()
