import { verifyKey } from 'discord-interactions'
import { Context, Next } from 'koa'
import dotenv from 'dotenv'
import { DiscordId, MyContext } from '../controllers/interactionRouter'
import { HttpStatusCode } from 'axios'
import { Monitor } from '../controllers/interactionRouter'

dotenv.config()

export const verifyDiscordRequest = async (ctx: Context, next: Next): Promise<void> => {
	const rawBody: string = ctx.request.rawBody
	const signature: string = ctx.get('X-Signature-Ed25519')!
	const timestamp: string = ctx.get('X-Signature-Timestamp')!

	const verified: boolean = verifyKey(rawBody, signature, timestamp, process.env.PUBLIC_KEY!)

	ctx.assert(verified, 401, 'invalid request signature')
	await next()
}

export const userParser = async (ctx: Context, next: Next): Promise<void> => {
	try {
		// @ts-expect-error
		const discordId: DiscordId = ctx.request.body.member.user.id
		ctx.state.discordId = discordId
	} catch (error) {
		console.log('userParser error')
	}
	await next()
}

export const channelIdParser = async (ctx: MyContext, next: Next): Promise<void> => {
	try {
		// @ts-expect-error
		const channelId: string = ctx.request.body.channel_id
		ctx.state.channelId = channelId
	} catch (error: any) {
		console.log('channelIdParser error')
	}
	await next()

	switch (ctx.state.monitor) {
		case Monitor.STARTUP:
			ctx.server.monitorStartUp(ctx.state.channelId)
			break
		case Monitor.SHUTDOWN:
			ctx.server.monitorShutDown(ctx.state.channelId)
			break
		case Monitor.NOTHING:
			break
		default:
			break
	}
}

export const tokenParser = async (ctx: Context, next: Next): Promise<void> => {
	const authHeader: string = ctx.get('Authorization')
	ctx.assert(authHeader, HttpStatusCode.Unauthorized)

	const token: string | undefined = authHeader.split(/\s/).pop()

	ctx.assert(token === process.env.MY_TOKEN, HttpStatusCode.Unauthorized)

	await next()
}

export const interactionErrorHandler = async (ctx: MyContext, next: Next): Promise<void> => {
	try {
		console.log('errorhandler 1 ')
		await next()
		console.log('errorhandler 2 ')
	} catch (error: any) {
		console.log('ERROR HAPPENED')
		console.error(error.message)
		// Request needs to succeed when replying to discord
		// ctx.reply(`Something unexpected happened: ${error.message}`, ctx)
	}
}
