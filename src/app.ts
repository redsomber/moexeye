import 'module-alias/register'
import 'reflect-metadata'
import 'source-map-support/register'

// import { DataModel } from '@/models/Data'
import { CronJob } from 'cron'
import { apiThrottler } from '@grammyjs/transformer-throttler'
import {
  getCurrentData,
  getLastData,
  postLastData,
  runCron,
} from '@/controllers/bot'
import { ignoreOld, sequentialize } from 'grammy-middlewares'
import { run } from '@grammyjs/runner'
import attachUser from '@/middlewares/attachUser'
import bot from '@/helpers/bot'
import configureI18n from '@/middlewares/configureI18n'
import handleLanguage from '@/handlers/language'
import i18n from '@/helpers/i18n'
import languageMenu from '@/menus/language'
import sendHelp from '@/handlers/help'
import startMongo from '@/helpers/startMongo'

const mapData = new Map()

let tempData: object

async function runApp() {
  console.log('Starting app...')
  // Mongo
  await startMongo()
  console.log('Mongo connected')

  runCron()

  const throttler = apiThrottler()
  bot.api.config.use(throttler)

  bot
    // Middlewares
    .use(sequentialize())
    .use(ignoreOld())
    .use(attachUser)
    .use(i18n.middleware())
    .use(configureI18n)
    // Menus
    .use(languageMenu)

  // Commands
  bot.command('get', async (ctx) => {
    await ctx.reply('data resieved')
    tempData = await getLastData()
  })
  bot.command('log', () => {
    console.log(tempData)
  })
  bot.command('curr', async () => {
    tempData = await getCurrentData(tempData)
  })
  bot.command('post', postLastData)
  bot.command(['help', 'start'], sendHelp)
  bot.command('language', handleLanguage)

  // Errors
  bot.catch(console.error)
  // Start bot
  await bot.init()
  run(bot)
  console.info(`Bot ${bot.botInfo.username} is up and running`)
}
void runApp()
export default mapData
