import { discordRequest } from './discordRequests'
import config from '../config'
import commands from '../commands'

async function deployCommands() {
  const url = `/applications/${config.DISCORD_APP_ID}/commands`
  console.log('Deploying commands')
  const res = await discordRequest(url, {
    data: commands,
    method: 'PUT',
  })
  console.log(res)
  console.log('Commands deployed!')
}

deployCommands()
