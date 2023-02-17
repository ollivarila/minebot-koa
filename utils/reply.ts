import { Context } from 'koa'
import { InteractionResponseType } from 'discord.js'

export type ReplyFunction = (data: string | object, ctx: Context) => void

export const reply = (data: string | object, ctx: Context) => {
  if (typeof data === 'string') {
    ctx.body = {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: data,
      },
    }
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
