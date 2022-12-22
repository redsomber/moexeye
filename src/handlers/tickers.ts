import Context from '@/models/Context'
import mapData from '@/app'

export default function getTickers(ctx: Context) {
  const tickers = Array.from(mapData.values())
  let text = ''
  tickers.forEach((item) => {
    text += `<code>${item[0]}</code>: ${(item[2] * 100).toFixed(1)}\n`
  })
  return ctx.reply(text, {
    parse_mode: 'HTML',
  })
}
