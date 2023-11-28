import { z } from 'zod'
import dotenv from 'dotenv'
dotenv.config()

const str = (d?: string) => (d ? z.string().default(d) : z.string())

const configSchema = z.object({
	PORT: str('8080'),
	NODE_ENV: str('development'),
	MY_TOKEN: z.string(),
	SUBSCRIPTION_ID: z.string(),
	RESOURCE_GROUP: z.string(),
	CONTAINER_GROUP: z.string(),
	CLIENT_ID: z.string(),
	CLIENT_SECRET: z.string(),
	TENANT_ID: z.string(),
})

export type Config = z.infer<typeof configSchema>

const config = {
	...configSchema.parse(process.env),
}

export default config
