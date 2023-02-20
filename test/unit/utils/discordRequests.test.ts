import { discordRequest, sendMessageToChannel } from '../../../utils/discordRequests'
import axiosMock from '../../mocks/axiosMock'

describe('Discord Requests', () => {
	describe('discordRequest', () => {
		beforeEach(() => {
			axiosMock.resetHistory()
		})

		it('adds the correct headers', async () => {
			const endpoint: string = '/mockEndpoint'
			process.env.DISCORD_TOKEN = 'token'

			await discordRequest(endpoint, {}, { method: 'GET' })

			const authHeader: string = axiosMock?.history?.get[0]?.headers?.Authorization

			expect(authHeader).toBe('Bot token')
		})

		it('sends request to the correct url', async () => {
			const endpoint: string = '/mockEndpoint'

			await discordRequest(endpoint, {}, { method: 'GET' })

			const url: string | undefined = axiosMock?.history?.get[0]?.url

			expect(url).toBe('https://discord.com/api/v10/mockEndpoint')
		})
	})

	describe('sendMessageToChannel', () => {
		beforeEach(() => {
			axiosMock.resetHistory()
		})

		it('sends correct data when message is a string', async () => {
			const mockData: string = 'mockData'

			await sendMessageToChannel(mockData, '1234567890')

			const data: string = axiosMock?.history?.post[0]?.data

			const parsed: any = JSON.parse(data)

			expect(parsed.content).toEqual(mockData)
		})

		it('sends correct data when message is an object', async () => {
			const mockData: object = {
				title: 'mockTitle',
			}

			await sendMessageToChannel(mockData, '1234567890')

			const data: string = axiosMock?.history?.post[0]?.data

			const parsed: any = JSON.parse(data)

			expect(parsed.embeds).toBeDefined()
		})
	})
})
