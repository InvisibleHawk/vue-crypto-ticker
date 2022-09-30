const API_KEY = 'c409232238d3508710a5599f4226424615c6dd491b874d3cdbf4755ece7348af'
const AGGREGATE_INDEX = '5';

const tickersHandlers = new Map()

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)

socket.addEventListener('message', (e) => {
    const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice }  = JSON.parse(e.data)
    if(type !== AGGREGATE_INDEX || newPrice === undefined) {
        return
    }
    const handlers = tickersHandlers.get(currency) ?? []
    handlers.forEach(fn => fn(newPrice))
})

function sendToWS(message) {
    const strMessage = JSON.stringify(message)
    if(socket.readyState === socket.OPEN)  {
        socket.send(strMessage)
        return
    }

    socket.addEventListener('open', () => {
        socket.send(strMessage)
    }, {once: true})  
}

function subscribeToTickerOnWS(tickerName) {
    const message = {
        action: 'SubAdd',
        subs: [`5~CCCAGG~${tickerName}~USD`]
    }

    sendToWS(message)
}

function unsubscribeFromTickerOnWS(tickerName) {
    const message = {
        action: 'SubRemove',
        subs: [`5~CCCAGG~${tickerName}~USD`]
    }

    sendToWS(message)
}

export const subscribeToTicker = (tickerName, cb) => {
    const subscribes = tickersHandlers.get(tickerName) || []
    tickersHandlers.set(tickerName, [...subscribes, cb])
    subscribeToTickerOnWS(tickerName)
}

export const unsubscribeFromTicker = (tickerName) => {
    console.log(`tickerName handler for ${tickerName} was delete`)
    tickersHandlers.delete(tickerName)
    unsubscribeFromTickerOnWS(tickerName)
}

export const getTickersList = () => 
    fetch(`https://min-api.cryptocompare.com/data/all/coinlist?summary=true`)
    .then(r => r.json())

window.tickersHandlers = tickersHandlers