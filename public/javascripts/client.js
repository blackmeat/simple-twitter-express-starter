// 使用WebSocket的網址向Server開啟連結
let ws = new WebSocket('ws://localhost:3000/')

// 開啟連結後執行的動作
ws.onopen = () => {
    console.log('open connection')
}

// 關閉連結後執行
ws.onclose = () => {
    console.log('close connection')
}

// 接收Server發出的訊息
ws.onmessage = event => {
    // 如果要接收Server送出來的data值，則是要用event.data去拿
    console.log(event)
}