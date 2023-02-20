import { channelIdParser, userParser, verifyDiscordRequest } from '../utils/middleware'
import dotenv from 'dotenv'
import { Context, DefaultState } from 'koa'
import { InteractionResponseType, InteractionType } from 'discord.js'
import { ReplyFunction } from '../utils/reply'
import ServerController from '../controllers/ServerController'
import Router from 'koa-router'
import EmbedFactory from '../utils/EmbedFactory'

interface MyState extends DefaultState {
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

const authorizedUsers: Array<DiscordId> = [
	'188329879861723136',
	'209654420999241728',
	'208247677585063936',
	'430991331880337408',
	'182935119625977867',
	'405711174668124160',
]

dotenv.config()

const interactionRouter: Router = new Router()

// @ts-ignore
interactionRouter.post(
	'/api/interactions',
	// @ts-ignore
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

async function handleInteractions(ctx: MyContext): Promise<void> {
	// @ts-expect-error
	const command = ctx.request.body.data.name
	ctx.state.monitor = Monitor.NOTHING

	switch (command) {
		case 'serverup':
			await handleServerUp(ctx)
			break
		case 'serverdown':
			await handleServerDown(ctx)
			break
		case 'getip':
			await handleGetIp(ctx)
			break
		case 'status':
			await handleGetStatus(ctx)
			break
		default:
			break
	}
}

async function handleServerUp(ctx: MyContext): Promise<void> {
	if (!authorized(ctx.state.discordId)) {
		ctx.reply('You are not authorized!', ctx)
		return
	}

	try {
		ctx.server.start()
	} catch (error: any) {
		ctx.reply(ctx.embedFactory.errorEmbed(error.message), ctx)
	}

	ctx.server.monitorStartUp(ctx)

	await ctx.reply('Starting server...', ctx)
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
	}

	ctx.server.monitorShutDown(ctx)

	await ctx.reply('Stopping server...', ctx)
}

async function handleGetIp(ctx: MyContext): Promise<void> {
	try {
		const ip: string = await ctx.server.getIp()
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
