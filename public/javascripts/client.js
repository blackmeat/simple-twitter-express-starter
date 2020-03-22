// 使用WebSocket的網址向Server開啟連結
const url = 'ws://' + window.location.href.substring(7)

let ws = new WebSocket(url)

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
const channel = document.querySelector('#channel')
const messagesRight = document.querySelector('#messagesRight')
const messagesLeft = document.querySelector('#messagesLeft')
let messagesStored = []
let allHtmlLeft = ``
let allHtmlRight = ``
// 接收Server發出的訊息
ws.onmessage = event => {
    // 把拿到的訊息送去HTML印出
    let eachHtml = `<li>${event.data}</li>`
    console.log('event.data here', event.data)
    let noHtml = `<li></li>`
    allHtmlLeft += eachHtml
    allHtmlRight += noHtml
    console.log(event.data)
    console.log(eachHtml)
    console.log(messagesLeft)
    messagesLeft.children[0].innerHTML = allHtmlLeft //列印別人
    messagesRight.children[0].innerHTML = allHtmlRight
}

messageForm.addEventListener('submit', event => {

    let eachHtml = `<li>${messageInput.value}</li>`
    let noHtml = `<li></li>`
    allHtmlRight += eachHtml   //列印自己
    allHtmlLeft += noHtml
    event.preventDefault()
    let message = {
        target1: channel.value,
        message1: messageInput.value
    }

    ws.send(JSON.stringify(message))

    messagesRight.children[0].innerHTML = allHtmlRight //列印
    messagesLeft.children[0].innerHTML = allHtmlLeft

})

