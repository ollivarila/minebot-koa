import { verifyKey } from 'discord-interactions'
import { Context, Next } from 'koa'
import dotenv from 'dotenv'
import { DiscordId, MyContext } from '../routers/interactionRouter'
import { HttpStatusCode } from 'axios'
import { Monitor } from '../routers/interactionRouter'
import Logger from './Logger'

dotenv.config()

export const verifyDiscordRequest = async (ctx: MyContext, next: Next): Promise<void> => {
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
		Logger.log('error', error)
	}
	await next()
}

export const channelIdParser = async (ctx: Context, next: Next): Promise<void> => {
	try {
		// @ts-expect-error
		const channelId: string = ctx.request.body.channel_id
		ctx.state.channelId = channelId
	} catch (error: any) {
		Logger.log('error', error)
	}
	await next()
}

export const checkAuth = async (ctx: Context, next: Next): Promise<void> => {
	const authHeader: string = ctx.get('Authorization')
	ctx.assert(authHeader !== '', HttpStatusCode.Unauthorized, 'No token provided')

	const token: string | undefined = authHeader.split(/\s/).pop()

	ctx.assert(token === process.env.MY_TOKEN, HttpStatusCode.Unauthorized, 'Token invalid')

	await next()
}
