import EmbedFactory from '../../../utils/EmbedFactory'

describe('EmbedFactory', () => {
	it('returns startUpEbmed', () => {
		const embed: any = new EmbedFactory().startedUpEmbed('test')

		expect(embed.data.title).toBe('Server started up')
	})

	it('returns stoppedEmbed', () => {
		const embed: any = new EmbedFactory().stoppedEmbed()

		expect(embed.data.title).toBe('Server stopped')
	})

	it('returns statusEmbed', () => {
		const embed: any = new EmbedFactory().statusEmbed('test', 'test')

		expect(embed.data.title).toBe('Server status')
		expect(embed.data.description).toBe('Server state: test')
	})

	it('returns errorEmbed', () => {
		const embed: any = new EmbedFactory().errorEmbed('test')

		expect(embed.data.title).toBe('Error')
		expect(embed.data.description).toBe('test')
	})

	it('returns ipEmbed', () => {
		const embed: any = new EmbedFactory().ipEmbed('test')

		expect(embed.data.title).toBe('Server ip')
		expect(embed.data.description).toBe('test')
	})
})
