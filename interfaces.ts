import { Context, DefaultState } from 'koa'
import { ReplyFunction } from './utils/reply'
import ServerController from './controllers/ServerController'
import EmbedFactory from './utils/EmbedFactory'

export interface MBState extends DefaultState {
	discordId: DiscordId
	channelId: string
}

export interface MBContext extends Context {
	reply: ReplyFunction
	state: MBState
	server: ServerController
	embedFactory: EmbedFactory
}

export type DiscordId = string
