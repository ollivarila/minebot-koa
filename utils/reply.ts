import { InteractionResponseType } from 'discord.js'
import { MyContext } from '../routers/interactionRouter'

export type ReplyFunction = (data: string | object, ctx: MyContext) => Promise<void>

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
