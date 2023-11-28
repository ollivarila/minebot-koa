import axios, { AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders } from 'axios'
import config from '../config'

const discordBaseUrl: string = 'https://discord.com/api/v10'

export const discordRequest = async (
  endpoint: string,
  options: AxiosRequestConfig,
): Promise<AxiosResponse<any, any> | null> => {
  const token = config.DISCORD_TOKEN
  try {
    const url: string = `${discordBaseUrl}${endpoint}`
    const headers: RawAxiosRequestHeaders = {
      Authorization: `Bot ${token}`,
      'User-Agent': 'MineBot (1.0.0)',
    }

    return await axios.request({
      url,
      headers,
      ...options,
    })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const sendMessageToChannel = async (
  message: any,
  channelId: string,
): Promise<AxiosResponse<any, any> | null> => {
  if (!channelId) throw new Error('No channel id provided!')

  let data: object = {}

  if (typeof message === 'object') {
    console.log(message.data)
    data = {
      embeds: [message.data],
    }
  }
  if (typeof message === 'string') {
    data = {
      content: message,
    }
  }

  const res = await discordRequest(`/channels/${channelId}/messages`, {
    data,
    method: 'POST',
  })

  console.log(res)
  return res
}
