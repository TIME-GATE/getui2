## Installation

`npm install getui2 --save`

## Tests

`npm test`

## Examples :

```js

/**
 * 个推配置
 * config {Obj}: 
 *  HOST：必选
 *  APPID: 必选 
 *  APPKEY: 必选 
 *  MASTERSECRET: 必选 
 */
const getui = require('getui2').GeTuiDecorator({
  HOST: 'http://sdk.open.api.igexin.com/apiex.htm',
  APPID: '',
  APPKEY: '',
  MASTERSECRET: '',
})

/**
 * 个推调用 返回promise对象,
 * message {Obj}: 
 *  title：必选 推送标题
 *  text: 必选 推送正文,
 *  url: 必选 跳转, 
 *  uidList: 可选 分组推送时用户uid
 */
const message = {
  title: '推送标题',
  text: '推送正文',
  url: `http://www.baidu.com`,
  uidList: ['777'],
}

/**
 * 透传消息 推送所有用户
 **/
getui.pushMessage(message, 'transmission', 'pushMessageToApp') 

/**
 * 跳转链接 推送给所有用户
 **/
getui.pushMessage(message, 'link', 'pushMessageToApp')

/**
 * 通知消息 推送给所有用户
 **/
getui.pushMessage(message, 'notification', 'pushMessageToApp')

/**
 * 透传消息 推送给分组用户 需要设置别名
 **/
getui.pushMessage(message, 'transmission', 'pushMessageToList')

/**
 * 通知消息 推送给分组用户 需要设置别名
 **/
getui.pushMessage(message, 'notification', 'pushMessageToList')
```

## Contributors

 - qian.zhang

## MIT Licenced

