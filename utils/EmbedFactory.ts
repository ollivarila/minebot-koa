import { EmbedBuilder } from '@discordjs/builders'

type Embed = object

export default class EmbedFactory {
	constructor() {}

	public startedUpEmbed(hostname: string): Embed {
		const builder: EmbedBuilder = new EmbedBuilder()
		builder.setTitle('Server started up')
		builder.setDescription('The server is now running')
		builder.setFields([{ name: 'Server address', value: hostname }])
		builder.setColor(0x00ff00)
		builder.setFooter({ text: 'MineBot' }).setTimestamp()

		return builder
	}

	public stoppedEmbed(): Embed {
		const builder: EmbedBuilder = new EmbedBuilder()
		builder.setTitle('Server stopped')
		builder.setDescription('The server is now stopped')
		builder.setColor(0xff0000)
		builder.setFooter({ text: 'MineBot' }).setTimestamp()

		return builder
	}

	public statusEmbed(state: string, hostname: string): Embed {
		const builder: EmbedBuilder = new EmbedBuilder()
		builder.setTitle('Server status')
		builder.setDescription(`Server state: ${state}`)
		state !== 'Terminated' && builder.setFields([{ name: 'Server address', value: hostname }])
		builder.setColor(0xffff00)
		builder.setFooter({ text: 'MineBot' }).setTimestamp()

		return builder
	}

	public errorEmbed(message: string): Embed {
		const builder: EmbedBuilder = new EmbedBuilder()
		builder.setTitle('Error')
		builder.setDescription(message)
		builder.setColor(0xff0000)
		builder.setFooter({ text: 'MineBot' }).setTimestamp()

		return builder
	}

	public ipEmbed(ip: string): Embed {
		const builder: EmbedBuilder = new EmbedBuilder()
		builder.setTitle('Server ip')
		builder.setDescription(ip)
		builder.setColor(0xffff00)
		builder.setFooter({ text: 'MineBot' }).setTimestamp()

		return builder
	}
}
