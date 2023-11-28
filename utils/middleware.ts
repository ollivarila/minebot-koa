import { verifyKey } from 'discord-interactions'
import { Context, Next } from 'koa'
import { HttpStatusCode } from 'axios'
import Logger from './Logger'
import { MBContext } from '../interfaces'
import config from '../config'

export const verifyDiscordRequest = async (ctx: MBContext, next: Next): Promise<void> => {
	const rawBody = ctx.request.rawBody
	const signature = ctx.get('X-Signature-Ed25519') ?? ''
	const timestamp = ctx.get('X-Signature-Timestamp') ?? ''

	const verified: boolean = verifyKey(rawBody, signature, timestamp, config.PUBLIC_KEY)
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
