import Router from 'koa-router'
import { MBContext, MBState } from '../interfaces'

const createRouter = () => new Router<MBState, MBContext>()

export default createRouter
