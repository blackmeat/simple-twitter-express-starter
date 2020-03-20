const url = 'ws://' + window.location.href.substring(7)
console.log(url)

// 使用WebSocket的網址向Server開啟連結
let ws = new WebSocket(url) // 這邊的網址都會是一樣!!!

// 開啟連結後執行的動作
ws.onopen = () => {
    console.log('open connection')
}

// 關閉連結後執行
ws.onclose = () => {
    console.log('close connection')
}

const messagesPrint = document.querySelector('#messagesPrint')
const messageForm = document.querySelector('#messageForm')
const messageInput = document.querySelector('#messageInput')
let messagesStored = []
let allHtml = ``
// 接收Server發出的訊息
ws.onmessage = event => {
    // 把拿到的訊息送去HTML印出
    let eachHtml = `<li>${event.data}</li>`
    allHtml += eachHtml
    messagesPrint.children[0].innerHTML = allHtml
}

messageForm.addEventListener('submit', event => {
    event.preventDefault()
    ws.send(messageInput.value)
})

