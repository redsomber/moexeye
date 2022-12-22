import 'module-alias/register'
import 'reflect-metadata'
import 'source-map-support/register'

import { apiThrottler } from '@grammyjs/transformer-throttler'
import { getCurrentData, getLastData } from '@/controllers/bot'
import { ignoreOld, sequentialize } from 'grammy-middlewares'
import { run } from '@grammyjs/runner'
import attachUser from '@/middlewares/attachUser'
import bot from '@/helpers/bot'
import configureI18n from '@/middlewares/configureI18n'
import getTickers from '@/handlers/tickers'
import handleLanguage from '@/handlers/language'
import i18n from '@/helpers/i18n'
import languageMenu from '@/menus/language'
import runCron from '@/handlers/cron'
import sendHelp from '@/handlers/help'
import startMongo from '@/helpers/startMongo'

const mapData = new Map()
let manualControl: object

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
    manualControl = await getLastData()
    await ctx.reply('received data')
  })
  bot.command('run', (ctx) => {
    setInterval(async () => {
      manualControl = await getCurrentData(manualControl)
    }, 10000)
  })
  bot.command('show', getTickers)
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
