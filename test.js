const getui = require('./GeTuiDecorator')({
  HOST: '',
  APPID: '',
  APPKEY: '',
  MASTERSECRET: '',
})

const message = {
  title: '推送标题',
  text: '推送正文',
  url: `http://www.baidu.com`,
  uidList: ['777'],
}

getui.pushMessage(message, 'transmission', 'pushMessageToList')