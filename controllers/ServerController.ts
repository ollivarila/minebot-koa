import { AxiosResponse } from 'axios'
import { getAddr, startCmd, statusCmd, stopCmd } from './Container'

// type ContainerResponse = AxiosResponse | null

// type ContainerState = 'Running' | 'Terminated' | 'Waiting'

// type ContainerAction = 'start' | 'stop' | 'status'

const raise =
  (error: string): (() => never) =>
  () => {
    throw new Error(error)
  }

export default class ServerController {
  constructor() {}

  // public async monitorStartUp(ctx: MyContext): Promise<void> {
  //   const response: ContainerResponse = await this.dispatchContainerAction('status')

  //   if (!response) {
  //     Logger.log('monitorStartUp: Something unexpected happened')
  //     return
  //   }

  //   try {
  //     const { properties } = response.data
  //     const container = properties.containers.pop()
  //     const state: ContainerState = container.properties?.instanceView?.currentState?.state

  //     if (state === 'Running') {
  //       Logger.log('Server is up and running')
  //       sendMessageToChannel(
  //         ctx.embedFactory.startedUpEmbed(process.env.HOSTNAME!),
  //         ctx.state.channelId,
  //       )

  //       return
  //     }
  //   } catch (error: any) {
  //     Logger.log(error.message)
  //   }

  //   Logger.log('Server is still starting up')
  //   setTimeout(() => this.monitorStartUp(ctx), 5_000)
  // }

  // public async monitorShutDown(ctx: MyContext): Promise<void> {
  //   const response: ContainerResponse = await this.dispatchContainerAction('status')

  //   if (!response) {
  //     Logger.log('monitorShutDown: Something unexpected happened')
  //     return
  //   }
  //   try {
  //     const { properties } = response.data
  //     const state: string = properties.instanceView.state

  //     if (state === 'Stopped') {
  //       Logger.log('Server is down')
  //       sendMessageToChannel(ctx.embedFactory.stoppedEmbed(), ctx.state.channelId)
  //       return
  //     }
  //   } catch (error: any) {
  //     Logger.log(error.message)
  //   }

  //   Logger.log('Server is still shutting down')
  //   setTimeout(() => this.monitorShutDown(ctx), 5_000)
  // }

  public async start(): Promise<void> {
    const res = await startCmd()
    res.unwrapOrElse(raise('Container start failed'))
  }

  public async stop(): Promise<void> {
    const res = await stopCmd()
    res.unwrapOrElse(raise('Container stop failed'))
  }

  public async status(): Promise<string> {
    const res = await statusCmd()
    const group = res.unwrapOrElse(raise('Container status check failed'))
    const container = group.containers.pop()
    const state = container?.instanceView?.currentState?.state

    return state ?? 'Container status not found'
  }

  public getIp(): string {
    return getAddr()
  }
}
