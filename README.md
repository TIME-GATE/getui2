## Installation

`npm install getui2 --save`

## Tests

`npm test`

## Examples :

```js
/**
 * 个推调用 返回promise对象,
 * message {Obj}: 
 *  title：必选 推送标题
 *  text: 必选 推送正文,
 *  url: 必选 跳转, 
 *  uidList: 可选 分组推送时用户uid
 */
const getui = require('./getui_demo')

const message = {
  title: '推送标题',
  text: '推送正文',
  url: `http://www.baidu.com`,
  uidList: ['777'],
}

getui.pushMessage(message, 'transmission', 'pushMessageToApp') // 透传消息 推送给所有 

getui.pushMessage(message, 'link', 'pushMessageToApp') // 跳转链接 推送给所有

getui.pushMessage(message, 'notification', 'pushMessageToApp') // 通知消息 推送给APP所有用户

getui.pushMessage(message, 'transmission', 'pushMessageToList') // 透传消息 推送给分组 需要设置别名

getui.pushMessage(message, 'notification', 'pushMessageToList') // 通知消息 推送给分组 需要设置别名

```

## Contributors

 - qian.zhang

## MIT Licenced

