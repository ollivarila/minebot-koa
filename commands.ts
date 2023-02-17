import { ApplicationCommandType } from 'discord.js'

type SlashCommand = {
  type: number
  name: string
  description: string
  options?: Array<Object>
}

const serverUp: SlashCommand = {
  type: ApplicationCommandType.ChatInput,
  name: 'serverup',
  description: 'Turns the server on if it is off',
}

const serverDown: SlashCommand = {
  type: ApplicationCommandType.ChatInput,
  name: 'serverdown',
  description: 'Turns the server off if you are authorized to do so',
}

const getIp: SlashCommand = {
  type: ApplicationCommandType.ChatInput,
  name: 'getip',
  description: 'Fetches the ip of the server if it is on',
}

const status: SlashCommand = {
  type: ApplicationCommandType.ChatInput,
  name: 'status',
  description: 'Get the status of the server',
}

const commands: Array<SlashCommand> = [serverUp, serverDown, getIp, status]

export default commands
