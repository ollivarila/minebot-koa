import { getAddr, startCmd, statusCmd, stopCmd } from './Container'

const raise =
	(error: string): (() => never) =>
	() => {
		throw new Error(error)
	}

export default class ServerController {
	constructor() {}

	public async start() {
		const poller = await this.startContainer()
		await this.waitForStart(poller)
	}

	private async startContainer() {
		const res = await startCmd()
		return res.unwrapOrElse(raise('Container start failed'))
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

	public async waitForStart(poller: Awaited<ReturnType<typeof this.startContainer>>) {
		await poller.pollUntilDone()
	}

	public getIp(): string {
		return getAddr()
	}
}
