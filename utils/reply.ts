import { Context } from 'koa'
import { InteractionResponseType } from 'discord.js'
import { MyContext } from '../controllers/interactionRouter'

export type ReplyFunction = (data: string | object, ctx: MyContext) => void

export const reply = async (data: string | object, ctx: MyContext): Promise<void> => {
	if (typeof data === 'string') {
		ctx.body = {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: data,
			},
		}
		return
	}

	if (typeof data === 'object') {
		ctx.body = {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				embeds: [data],
			},
		}
	}
}
