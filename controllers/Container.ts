import { ClientSecretCredential } from '@azure/identity'
import { ContainerInstanceManagementClient } from '@azure/arm-containerinstance'
import Logger from '../utils/Logger'
import config from '../config'
import { Maybe } from 'true-myth'

const creds = new ClientSecretCredential(config.TENANT_ID, config.CLIENT_ID, config.CLIENT_SECRET)

const client = new ContainerInstanceManagementClient(creds, config.SUBSCRIPTION_ID)

const runCmd = async <T>(cmd: () => Promise<T>): Promise<Maybe<T>> => {
  try {
    const res = await cmd()
    return Maybe.of(res)
  } catch (error) {
    Logger.error(`Error running container command: ${cmd}: `, (error as Error).message)
    return Maybe.nothing()
  }
}

export const startCmd = async () => {
  const cmd = () => client.containerGroups.beginStart(config.RESOURCE_GROUP, config.CONTAINER_GROUP)
  return runCmd(cmd)
}

export const stopCmd = async () => {
  const cmd = () => client.containerGroups.stop(config.RESOURCE_GROUP, config.CONTAINER_GROUP)
  return runCmd(cmd)
}

export const statusCmd = async () => {
  const cmd = () => client.containerGroups.get(config.RESOURCE_GROUP, config.CONTAINER_GROUP)
  return runCmd(cmd)
}

export const getAddr = () => 'skdmc-gaming.northeurope.azurecontainer.io'
