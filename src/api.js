const API_KEY = 'c409232238d3508710a5599f4226424615c6dd491b874d3cdbf4755ece7348af'

const tickersHandlers = new Map()

export const loadTicker = () => {

    if(tickersHandlers.size === 0 ) return

    fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()].join(',')}&tsyms=USD&api_key=${API_KEY}`)
    .then(r => r.json())
    .then(rawData =>  {
        const updatedPrices = Object.fromEntries(Object.entries(rawData).map(([key, value]) => [key, value.USD]))
        Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
            const handlers = tickersHandlers.get(currency) ?? []
            handlers.forEach(fn => fn(newPrice))
        })
    })
}

export const subscribeToTicker = (tickerName, cb) => {
    const subscribes = tickersHandlers.get(tickerName) || []
    tickersHandlers.set(tickerName, [...subscribes, cb])
}

export const unsubscribeFromTicker = (tickerName) => {
    console.log(`tickerName handler for ${tickerName} was delete`)
    tickersHandlers.delete(tickerName)
}


setInterval(loadTicker, 5000)

window.tickersHandlers = tickersHandlers