var content = [] // { type:'send'| 'get'| 'remind' , content:'',  }
var mode = '' // pair | communication
var currentMode = ''
var SerialPort = require('serialport')
var sp = new SerialPort('COM4', {
    //波特率，可在设备管理器中对应端口的属性中查看
    baudRate: 115200,
    autoOpen: false
})
//打开串口
function openS() {
    console.log(sp);
    sp.open(function (e) {
        console.log(sp);
        console.log('IsOpen:', sp.isOpen)
        console.log('err:', e)
        if(e){
            save( 'remind',e)
        }else{
            save('remind', '串口已打开')
        }
/*
        if (!e) {
            //16进制Buffer流
            // sendToPort("AT+VER?\r")
            sendToPort("+++")
            // sendToPort("2B2B2B")

        }*/
    })
}

var count = 0;
//指令监听
sp.on('data', function (data) {
    console.log('received: ' + data)
    save('get', data)
    // 区分是否是在状态
    if(mode === 'pair'){
        if (count === 0 && data == 'a'){
            sendToPort('a')
            count ++
            save('remind','执行完成')
            currentMode = 'pair'
            clearMode()
        }else{
            save('remind','执行失败')
            clearMode()
        }
       /* if (count === 1 && data == 'a'){
        }else{
            save('remind','执行失败')
            clearMode()
        }*/
    }
    if(mode === 'communication'){
        console.log('communication',data, data == 'AT+ENTM');
        if (count === 0 && data == 'AT+ENTM\r'){
            save('remind','执行完成')
            currentMode = 'communication'
            clearMode()
        }else{
            save('remind','执行失败')
            clearMode()
        }
    }
    /*if (data == 'a'){
        sendToPort('a')
        // sendToPort('61')
    }else {
        if (times == 0){
            times ++
            // sendToPort('41542B5645523F')
            sendToPort('AT+VER?')
        }

    }*/
})
//错误监听
sp.on('error', function (error) {
    console.log('error: ' + error)
    save('remind',error)
})
//发送数据
function sendToPort(str) {
    console.log('send : ' + str,sp.isOpen)
    if(sp.isOpen){
        const buf = new Buffer.from(str) //a
        console.log('buf',buf);
        sp.write(buf)
        save( 'send',str)
    }else{
        save( 'remind','串口未打开')
    }
}
//关闭串口
function  closeS() {
    sp.close(function (err) {
        console.log(err);
        if(err){
        }else{
            save( 'remind','串口已关闭')
        }
    })
}
//发送数据
function  sendS() {
    var input = document.getElementById('input').value
    sendToPort(input)
}
//进入配置状态
function pairMode(){
    mode = 'pair'
    sendToPort('+++')
}
//帮助信息
function helpInfo(){
    sendToPort('AT+H\r')
}
//帮助信息
function searchVersion(){
    sendToPort('AT+VER?\r')
}
//进入配置状态
function communicationMode(){
    mode = 'communication'
    sendToPort('AT+ENTM\r')
}
function save(type, str) {
    content.push({type: type,content: str})
    render()
}

function clearMode(){
    mode = ''
    count = 0
    renderState()
}
function renderState() {
    //    状态
    var online = sp.isOpen
    var modeHtml = ''
    switch (currentMode) {
        case "pair":
            modeHtml += '<span class="state info">配置模式</span>'
            break
        case "communication":
            modeHtml += '<span class="state info">通讯模式</span>'
            break
    }
    var nodeState = document.getElementById('state-box')
    nodeState.innerHTML = `串口状态：${online?'<span class="state right">在线</span>':'<span class="state error">离线</span>'}${modeHtml}
    `
}
function render() {
    var node = document.getElementById('content')
    var temp = ''
    for (let i = 0; i < content.length; i++) {
        temp += `<div class="${content[i].type}">
            <span>${content[i].content}</span>
        </div>`
    }
    node.innerHTML = temp
    node.scrollTop = node.scrollHeight;

    renderState()
}
function initEvent() {
    ipcRenderer.on('toggle-over', (event, arg) => {
        isOpen = !isOpen
        console.log('over',isOpen);
        // document.getElementById('devTool').innerText = isOpen? '关闭控制台':'打开控制台'
    })
    document.onkeydown = function mdClick(event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        console.log(e);
        if(e.key === "F12"){
            ipcRenderer.send('toggle-devTool', 'ping')
        }
    }
}
var isOpen = false
const { ipcRenderer } = require('electron')

initEvent()
render()
