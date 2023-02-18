import axios, { AxiosResponse, RawAxiosRequestHeaders } from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const token: string | undefined = process.env.DISCORD_TOKEN

const discordBaseUrl: string = 'https://discord.com/api/v10'

if (!token) throw new Error('No token provided!')

export const discordRequest = async (
	endpoint: string,
	data: any,
	options: any
): Promise<AxiosResponse<any, any> | null> => {
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
	message: string,
	channelId: string
): Promise<AxiosResponse<any, any> | null> => {
	const data = {
		content: message,
	}

	return await discordRequest(`/channels/${channelId}/messages`, data, {
		method: 'POST',
	})
}
