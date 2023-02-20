import dotenv from 'dotenv'
import qs from 'qs'
import axios, { AxiosResponse, RawAxiosRequestHeaders } from 'axios'
import TokenManager from './TokenManager'
import { sendMessageToChannel } from '../utils/discordRequests'
import { MyContext } from '../routers/interactionRouter'
import { TransformStreamDefaultController } from 'node:stream/web'

dotenv.config()

type ContainerResponse = AxiosResponse | null

type ContainerState = 'Running' | 'Terminated' | 'Waiting'

type ContainerAction = 'start' | 'stop' | 'status'

export default class ServerController {
	private tokenManager: TokenManager = new TokenManager()
	private hostname: string

	constructor(hostname: string) {
		if (!hostname) {
			throw new Error('Error: no hostname provided')
		}
		this.hostname = hostname
	}

	private async authenticate() {
		const { CLIENT_ID, CLIENT_SECRET, TENANT_ID } = process.env

		if (!CLIENT_ID || !CLIENT_SECRET || !TENANT_ID) {
			throw new Error('Error: no credentials provided')
		}

		const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`

		const data = {
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			grant_type: 'client_credentials',
			scope: 'https://management.azure.com/.default',
		}

		const headers = {
			'content-type': 'application/x-www-form-urlencoded',
		}

		try {
			console.log('Authenticating...')
			const response = await axios.post(url, qs.stringify(data), {
				headers,
			})
			this.tokenManager.setToken(response.data['access_token'])
			console.log('Authenticated', await this.tokenManager.tokenIsValid())
		} catch (error) {
			this.tokenManager.resetToken()
		}
	}

	private async verifyAuth(): Promise<void> {
		const tokenValid: boolean = this.tokenManager.tokenIsValid()
		if (!tokenValid) {
			await this.authenticate()
		}
	}

	public async monitorStartUp(ctx: MyContext): Promise<void> {
		await this.verifyAuth()
		const response: ContainerResponse = await this.dispatchContainerAction('status')

		if (!response) {
			console.log('monitorStartUp: Something unexpected happened')
			return
		}

		try {
			const { properties } = response.data
			const container = properties.containers.pop()
			const state: ContainerState = container.properties?.instanceView?.currentState?.state

			if (state === 'Running') {
				console.log('Server is up and running')
				sendMessageToChannel(ctx.embedFactory.startedUpEmbed(process.env.HOSTNAME!), ctx.channelId)

				return
			}
		} catch (error: any) {
			console.log(error.message)
		}

		console.log('Server is still starting up')
		setTimeout(() => this.monitorStartUp(ctx), 5_000)
	}

	public async monitorShutDown(ctx: MyContext): Promise<void> {
		await this.verifyAuth()
		const response: ContainerResponse = await this.dispatchContainerAction('status')

		if (!response) {
			console.log('monitorShutDown: Something unexpected happened')
			return
		}
		try {
			const { properties } = response.data
			const state: string = properties.instanceView.state

			if (state === 'Stopped') {
				console.log('Server is down')
				sendMessageToChannel(ctx.embedFactory.stoppedEmbed(), ctx.channelId)
				return
			}
		} catch (error: any) {
			console.log(error.message)
		}

		console.log('Server is still shutting down')
		setTimeout(() => this.monitorShutDown(ctx), 5_000)
	}

	public async start(): Promise<void> {
		try {
			console.log('Starting server...')
			await this.verifyAuth()
			await this.dispatchContainerAction('start')
		} catch (error: any) {
			console.error('Something went wrong with start:\n' + error.message)
			throw error
		}
	}

	public async stop(): Promise<void> {
		try {
			console.log('Stopping server...')
			await this.verifyAuth()
			await this.dispatchContainerAction('stop')
		} catch (error: any) {
			console.error('Something went wrong with stop:\n' + error.message)
			throw error
		}
	}

	public async status(): Promise<string> {
		console.log('Checking server status...')
		await this.verifyAuth()

		const response: ContainerResponse = await this.dispatchContainerAction('status')

		if (!response) {
			throw new Error('Failed to get container status')
		}

		const { properties } = response.data
		const container = properties.containers.pop()
		const state: ContainerState = container.properties.instanceView.currentState.state

		return state
	}

	public async getIp(): Promise<string> {
		console.log('Getting server ip...')
		await this.verifyAuth()
		const response: ContainerResponse = await this.dispatchContainerAction('status')

		// @ts-ignore
		const { properties } = response.data
		const container = properties.containers.pop()
		const state: ContainerState = container.properties.instanceView.currentState.state

		if (state === 'Running') {
			return this.hostname
		}

		return "Server state is not yet 'Running'"
	}

	private async dispatchContainerAction(action: ContainerAction): Promise<ContainerResponse> {
		const { SUBSCRIPTION_ID, RESOURCE_GROUP, CONTAINER_GROUP } = process.env

		if (!SUBSCRIPTION_ID || !RESOURCE_GROUP || !CONTAINER_GROUP) {
			throw new Error('Error: necessary environment variables missing')
		}

		const headers: RawAxiosRequestHeaders = {
			Authorization: `Bearer ${this.tokenManager.getToken()}`,
		}

		try {
			if (action === 'status') {
				const url: string = `https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.ContainerInstance/containerGroups/${CONTAINER_GROUP}?api-version=2022-10-01-preview`
				return axios.get(url, {
					headers,
				})
			}

			const url: string = `https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.ContainerInstance/containerGroups/${CONTAINER_GROUP}/${action}?api-version=2022-10-01-preview`
			return axios.post(url, undefined, {
				headers,
			})
		} catch (error) {
			return null
		}
	}
}
