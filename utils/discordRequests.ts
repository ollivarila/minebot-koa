import axios, { AxiosResponse, RawAxiosRequestHeaders } from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const discordBaseUrl: string = 'https://discord.com/api/v10'

export const discordRequest = async (
	endpoint: string,
	data: any,
	options: any
): Promise<AxiosResponse<any, any> | null> => {
	const token: string | undefined = process.env.DISCORD_TOKEN
	if (!token) throw new Error('No token provided!')
	try {
		const url: string = `${discordBaseUrl}${endpoint}`
		const headers: RawAxiosRequestHeaders = {
			Authorization: `Bot ${token}`,
			'User-Agent': 'MineBot (1.0.0)',
		}

		return await axios.request({
			url,
			data,
			headers,
			...options,
		})
	} catch (error) {
		return null
	}
}

export const sendMessageToChannel = async (
	message: string | object,
	channelId: string
): Promise<AxiosResponse<any, any> | null> => {
	let data: object = {}

	if (typeof message === 'object') {
		data = {
			embeds: [message],
		}
	}

	if (typeof message === 'string') {
		data = {
			content: message,
		}
	}

	return await discordRequest(`/channels/${channelId}/messages`, data, {
		method: 'POST',
	})
}
