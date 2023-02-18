import dotenv from 'dotenv'
import qs from 'qs'
import axios, { AxiosResponse, RawAxiosRequestHeaders } from 'axios'
import TokenManager from './TokenManager'
import { sendMessageToChannel } from '../utils/discordRequests'

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
			console.log('Authenticated')
		} catch (error) {
			this.tokenManager.resetToken()
		}
	}

	private async verifyAuth(): Promise<void> {
		if (!this.tokenManager.tokenIsValid()) {
			await this.authenticate()
		}
	}

	public async monitorStartUp(channelId: string): Promise<void> {
		const response: ContainerResponse = await this.dispatchContainerAction('status')

		if (!response) {
			console.log('monitorStartUp: Something unexpected happened')
			return
		}

		try {
			const { properties } = response.data
			const container = properties.containers.pop()
			console.log(container.properties.instanceView.currentState)
			const state: ContainerState = container.properties.instanceView.currentState.state

			if (state === 'Running') {
				console.log('Server is up and running')
				sendMessageToChannel('Server is up and running', channelId)

				return
			}
		} catch (error: any) {
			console.log(error.message)
		}

		console.log('Server is still starting up')
		setTimeout(() => this.monitorStartUp(channelId), 5_000)
	}

	public async monitorShutDown(channelId: string): Promise<void> {
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
				sendMessageToChannel('Server stopped succesfully!', channelId)
				return
			}
		} catch (error: any) {
			console.log(error.message)
		}

		console.log('Server is still shutting down')
		setTimeout(() => this.monitorShutDown(channelId), 5_000)
	}

	public async start(): Promise<string> {
		try {
			console.log('Starting server...')
			await this.verifyAuth()
			const response: ContainerResponse = await this.dispatchContainerAction('start')

			if (!response) {
				return 'Error with dispatching container action'
			}

			if (response.status === 202) {
				return 'Monitoring startup...'
			}

			if (response.status === 204) {
				return 'Server is already running!'
			}

			return 'Something unexpected happened'
		} catch (error: any) {
			return 'Something went wrong with start\n' + error.message
		}
	}

	public async stop(): Promise<string> {
		try {
			console.log('Stopping server...')
			await this.verifyAuth()

			const response: ContainerResponse = await this.dispatchContainerAction('stop')

			if (!response) {
				return 'Error with dispatching container action'
			}

			if (response.status === 204) {
				return 'Stopping server...'
			}

			return 'Something unexpected happened'
		} catch (error: any) {
			return 'Something went wrong with stop:\n' + error.message
		}
	}

	public async status(): Promise<string> {
		try {
			console.log('Checking server status...')
			await this.verifyAuth()

			const response: ContainerResponse = await this.dispatchContainerAction('status')

			if (!response) {
				return 'Something unexpected happened'
			}
			const { properties } = response.data
			const container = properties.containers.pop()
			const state: ContainerState = container.properties.instanceView.currentState.state

			return `Server state: ${state}\nServer address: ${
				state === 'Running' ? this.hostname : "wait for until state is 'Running'"
			}`
		} catch (error: any) {
			return 'Something went wrong with status:\n' + error.message
		}
	}

	public async getIp(): Promise<string> {
		try {
			console.log('Getting server ip...')
			await this.verifyAuth()
			const response: ContainerResponse = await this.dispatchContainerAction('status')

			// @ts-ignore
			const { properties } = response.data
			const container = properties.containers.pop()
			const state: ContainerState = container.properties.instanceView.currentState.state

			if (state === 'Running') {
				return `Server address: ***${this.hostname}***`
			}

			return "Server state is not yet 'Running'"
		} catch (error: any) {
			return 'Something went wrong with getIp:\n' + error.message
		}
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
