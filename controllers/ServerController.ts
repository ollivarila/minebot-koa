export default class ServerController {
  private tokenGranted: Date
  private token: string

  constructor() {}

  private async authenticate(): Promise<void> {}

  private async verifyAuth(): Promise<void> {
    if (!this.token) {
      await this.authenticate()
    }

    const ONE_HOUR: number = 3_600_000
    const now: Date = new Date()

    if (now.getTime() - this.tokenGranted.getTime() >= ONE_HOUR) {
      await this.authenticate()
    }
  }

  public async start(): Promise<string> {}

  public async stop(): Promise<string> {}

  public async status(): Promise<string> {}

  public async getIp(): Promise<string> {}
}
