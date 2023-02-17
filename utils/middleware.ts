import { verifyKey } from 'discord-interactions'
import { Context, Next } from 'koa'
import dotenv from 'dotenv'

dotenv.config()

export const verifyDiscordRequest = (ctx: Context, next: Next): void => {
  const rawBody: string = ctx.request.rawBody
  const signature: string = ctx.get('X-Signature-Ed25519')!
  const timestamp: string = ctx.get('X-Signature-Timestamp')!

  const verified: boolean = verifyKey(
    rawBody,
    signature,
    timestamp,
    process.env.PUBLIC_KEY!,
  )

  ctx.assert(verified, 401, 'invalid request signature')
  next()
}
