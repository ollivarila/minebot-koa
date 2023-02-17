import axios, { AxiosResponse, RawAxiosRequestHeaders } from 'axios'
import dotenv from 'dotenv'
import { ServerResponse } from 'http'
import qs from 'qs'

dotenv.config()

type ContainerResponse = AxiosResponse | null

type ContainerState = 'Running' | 'Terminated' | 'Waiting'

type ContainerAction = 'start' | 'stop' | 'status'

export default class ServerController {
  private tokenGranted: number | undefined
  private token: string | undefined
  private domain: string
  private shouldBeRunning: boolean

  constructor(domain: string) {
    this.domain = domain
    this.shouldBeRunning = false
  }

  private async authenticate(): Promise<void> {
    const url = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`

    const { CLIENT_ID, CLIENT_SECRET } = process.env

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
      const response: AxiosResponse = await axios.post(url, qs.stringify(data), {
        headers,
      })
      this.tokenGranted = Date.now()
      this.token = response.data['access_token']
    } catch (e: any) {
      console.error(e.message)
    }
  }

  private async verifyAuth(): Promise<void> {
    if (!this.token) {
      await this.authenticate()
    }

    if (!this.tokenGranted) {
      throw new Error('ERROR: tokenGranted = undefined')
    }

    const ONE_HOUR: number = 3_600_000
    const now: number = Date.now()

    if (now - this.tokenGranted >= ONE_HOUR) {
      await this.authenticate()
    }
  }

  public async start(): Promise<string> {
    await this.verifyAuth()
    const response: ContainerResponse = await this.dispatchContainerAction('start')

    this.shouldBeRunning = true

    if (!response) {
      return 'Error with dispatching container action'
    }

    if (response.status === 202) {
      return 'Server starting\nPlease wait for confirmation'
    }

    if (response.status === 204) {
      return 'Server is already running'
    }

    return 'Something unexpected happened'
  }

  public async stop(): Promise<string> {
    await this.verifyAuth()

    const response: ContainerResponse = await this.dispatchContainerAction('stop')

    this.shouldBeRunning = false

    if (!response) {
      return 'Error with dispatching container action'
    }

    if (response.status === 204) {
      return 'Server stopped'
    }

    return 'Something unexpected happened'
  }

  public async status(): Promise<string> {
    await this.verifyAuth()

    const response: ContainerResponse = await this.dispatchContainerAction('status')

    if (!response) {
      return 'Something unexpected happened'
    }
    const { properties } = response.data
    const container = properties.containers.pop()
    const state: ContainerState = container.properties.instanceView.currentState.state

    return `Server state: ${state}\nServer address: ${
      state === 'Running' ? this.domain : "wait for until state is 'Running'"
    }`
  }

  public async getIp(): Promise<string> {
    if (!this.shouldBeRunning) {
      return 'Server is not running'
    }

    const response: ContainerResponse = await this.dispatchContainerAction('status')

    if (!response) {
      return 'Something unexpected happened'
    }

    const { properties } = response.data
    const container = properties.containers.pop()
    const state: ContainerState = container.properties.instanceView.currentState.state

    if (state === 'Running') {
      return `Server address ${this.domain}`
    }

    return "Server state is yet 'Running'"
  }

  private async dispatchContainerAction(action: ContainerAction): Promise<ContainerResponse> {
    const { SUBSCRIPTION_ID, RESOURCE_GROUP, CONTAINER_GROUP } = process.env

    if (!this.token) {
      throw new Error('ERROR: no token')
    }

    const headers: RawAxiosRequestHeaders = {
      Authorization: `Bearer ${this.token}`,
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
