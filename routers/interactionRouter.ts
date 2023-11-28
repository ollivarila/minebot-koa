import { channelIdParser, userParser, verifyDiscordRequest } from '../utils/middleware'
import dotenv from 'dotenv'
import { Context, DefaultState } from 'koa'
import { InteractionResponseType, InteractionType } from 'discord.js'
import { ReplyFunction } from '../utils/reply'
import ServerController from '../controllers/ServerController'
import Router from 'koa-router'
import EmbedFactory from '../utils/EmbedFactory'
import { sendMessageToChannel } from '../utils/discordRequests'

export interface MyState extends DefaultState {
	discordId: DiscordId
	channelId: string
	monitor: Monitor
}

export interface MyContext extends Context {
	reply: ReplyFunction
	state: MyState
	server: ServerController
	embedFactory: EmbedFactory
}

export type DiscordId = string

export enum Monitor {
	STARTUP,
	SHUTDOWN,
	NOTHING,
}

const authorizedUsers: Array<DiscordId> = ['188329879861723136']

dotenv.config()

const interactionRouter = new Router<MyState, MyContext>()

interactionRouter.post(
	'/api/interactions',
	verifyDiscordRequest,
	userParser,
	channelIdParser,
	async (ctx: MyContext): Promise<void> => {
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
	}
)

const commands: Record<string, (ctx: MyContext) => Promise<void>> = {
	serverup: handleServerUp,
	serverdown: handleServerDown,
	getip: handleGetIp,
	status: handleGetStatus,
}

async function handleInteractions(ctx: MyContext): Promise<void> {
	// @ts-expect-error
	const command = ctx.request.body.data.name
	ctx.state.monitor = Monitor.NOTHING
	const handler = commands[command]
	await handler(ctx)
}

async function handleServerUp(ctx: MyContext): Promise<void> {
	if (!authorized(ctx.state.discordId)) {
		ctx.reply('You are not authorized!', ctx)
		return
	}

	await ctx.reply('Starting server...', ctx)
	try {
		await ctx.server.start()
	} catch (error: any) {
		ctx.reply(ctx.embedFactory.errorEmbed(error.message), ctx)
		return
	}
	await sendMessageToChannel(ctx.embedFactory.startedUpEmbed(ctx.server.getIp()), ctx.state.channelId)
}

async function handleServerDown(ctx: MyContext): Promise<void> {
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
	await ctx.reply('Server stopped!', ctx)
}

async function handleGetIp(ctx: MyContext): Promise<void> {
	try {
		const ip: string = ctx.server.getIp()
		ctx.reply(ctx.embedFactory.ipEmbed(ip), ctx)
	} catch (error: any) {
		ctx.reply(ctx.embedFactory.errorEmbed(error.message), ctx)
	}
}

async function handleGetStatus(ctx: MyContext): Promise<void> {
	try {
		const status: string = await ctx.server.status()
		ctx.reply(ctx.embedFactory.statusEmbed(status, process.env.HOSTNAME!), ctx)
	} catch (error: any) {
		ctx.reply(ctx.embedFactory.errorEmbed(error.message), ctx)
	}
}

function authorized(discordId: DiscordId): boolean {
	return authorizedUsers.includes(discordId)
}

export default interactionRouter.routes()
