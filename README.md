## Installation

`npm install getui2`

## Tests

`npm test`

## Examples :

```bash

/**
 * ./getui.js文件
 */
const GeTui = require('getui2').GeTui
const Target = require('getui2').Target

const BaseTemplate = require('getui2').BaseTemplate
const TransmissionTemplate = require('getui2').TransmissionTemplate
const LinkTemplate = require('getui2').LinkTemplate
const NotificationTemplate = require('getui2').NotificationTemplate
const NotyPopLoadTemplate = require('getui2').NotyPopLoadTemplate

const AppMessage = require('getui2').AppMessage
const ListMessage = require('getui2').ListMessage
const SingleMessage = require('getui2').SingleMessage

const APNPayload = require('getui2').APNPayload
const SimpleAlertMsg = require('getui2').SimpleAlertMsg

/**
 * 1 GeTuiConfig.HOST GeTuiConfig.APPKEY GeTuiConfig.MASTERSECRET 独立文件配置
 * 2 Code CodeMsg 自定义返回信息
 */
const gt = new GeTui(GeTuiConfig.HOST, GeTuiConfig.APPKEY, GeTuiConfig.MASTERSECRET)

class PushMessage {
  constructor(message, targets, options) {
    this._message = message || {}
  }

  choosePushFn(methodName, messageConfig, pushTargets) {
    try {
      switch (methodName) {
        case 'pushMessageToApp':
          return new Promise((resolve, reject) => {
            gt.pushMessageToApp(messageConfig, null, (err, res) => {
              console.log(`################### ${methodName} HAVE DONE ###################\n`, res)
              if(!err && 'ok' === res.result) return resolve({ code: 0, message: '推送成功' })
              resolve({ code: Code.PUSH_ERR, message: CodeMsg[34016]})
            })
          })
        case 'pushMessageToList':
          return new Promise((resolve, reject) => {
            gt.getContentId(messageConfig, null, (err, res) => {
              console.log(`################### ${methodName} getContentId HAVE DONE ###################\n`, res)
              gt.pushMessageToList(res, pushTargets, (err, res) => {
                console.log(`################### ${methodName} HAVE DONE ###################\n`, res)
                if(!err && 'ok' === res.result) return resolve({ code: 0, message: '推送成功' })
                resolve({ code: Code.PUSH_ERR, message: CodeMsg[34016]})
              })
            })
          })
        case 'pushMessageToSingle':
          return new Promise((resolve, reject) => {
            gt.pushMessageToSingle(messageConfig, pushTargets, (err, res) => {
              console.log(`################### ${methodName} HAVE DONE ###################\n`, res)
              if(!err && !err.exception && err.exception instanceof  RequestError){
                const requestId = err.exception.requestId
                gt.pushMessageToSingle(messageConfig, pushTargets, requestId, (err, res) => {
                  console.log(`################### ${methodName} HAVE DONE ###################\n`, res)
                  if(!err && 'ok' === res.result) return resolve({ code: 0, message: '推送成功' })
                  resolve({ code: Code.PUSH_ERR, message: CodeMsg[34016]})
                })
              }
            })
          })
        default:
          return new Promise((resolve, reject) => {
            gt.pushMessageToApp(messageConfig, null, (err, res) => {
              console.log(`################### ${methodName} HAVE DONE ###################\n`, res)
              if(!err && 'ok' === res.result) return resolve({ code: 0, message: '推送成功' })
              resolve({ code: Code.PUSH_ERR, message: CodeMsg[34016]})
            })
          })
      }
    } catch(err) {
      console.log(`################### ${methodName} ERROR ###################\n`, err)
    } 
  }

  pushMessage(message, templateType, methodName) {
    const uidList = JSON.parse(message.uidList || '[]')
    const pushTargets = uidList.map((uid) => {
       return new Target({ appId: GeTuiConfig.APPID, alias: uid })
     })

    console.log(`################### PUSH MESSAGE UIDS ###################\n`, pushTargets)
    
    const messageTemplate = this.setMessageTemplate(message, templateType)
    const messageConfig = this.setMessageConfig(messageTemplate, methodName)
    
    return this.choosePushFn(methodName, messageConfig, pushTargets)    
  }
      
  setMessageConfig(template, methodName) {
    switch (methodName) {
      case 'pushMessageToApp':
        return new AppMessage({
          isOffline: true,
          offlineExpireTime: 3600 * 12 * 1000,
          data: template,
          appIdList: [GeTuiConfig.APPID],
          speed: 10000
        })
      case 'pushMessageToList':
        return new ListMessage({
          isOffline: true,
          offlineExpireTime: 3600 * 12 * 1000,
          data: template
        })
      case 'pushMessageToSingle': 
        return new SingleMessage({
          isOffline: true,
          offlineExpireTime: 3600 * 12 * 1000,
          data: template,
          pushNetWorkType: 0
        })
      default:
        return new AppMessage({
          isOffline: true,
          offlineExpireTime: 3600 * 12 * 1000,
          data: template,
          appIdList: [GeTuiConfig.APPID],
          speed: 10000
        })
    }
  }

  setMessageTemplate(message = {}, templateType) {
    switch (templateType) {
      case 'transmission':
        return this.composeAPNTransmissionMessage(message)
      case 'notification':
        return new NotificationTemplate(message)
      case 'link':
        return new LinkTemplate(this.composeLinkMessage(message))
      case 'load':
        return new NotyPopLoadTemplate(message)
      case 'base':
        return new BaseTemplate(message)
      default:
        return new BaseTemplate(message)
    } 
  }

  composeLinkMessage(message) {
    return {
      appId: GeTuiConfig.APPID, 
      appkey: GeTuiConfig.APPKEY,
      title: message.title,
      text: message.text,
      logoUrl: message.logoUrl || message.url,
      isRing: true,
      isVibrate: true,
      isClearable: true,
      url: message.url
    } 
  }

  composeTransmissionMessage(message) {
    return {
      appId: GeTuiConfig.APPID, 
      appkey: GeTuiConfig.APPKEY,
      transmissionType: 2,
      transmissionContent: message
    }
  }

  composeAPNTransmissionMessage(message) {
    const template = new TransmissionTemplate(this.composeTransmissionMessage(message))
    const payload = new APNPayload()
    const alertMsg = new SimpleAlertMsg()
    alertMsg.alertMsg = 'app推送'
    payload.alertMsg = alertMsg
    payload.badge = 1
    payload.contentAvailable = 1
    payload.category = "ACTIONABLE"
    payload.customMsg.payload1 = Helper.formatTransmissioMsg(message)
    template.setApnInfo(payload)
    return template
  }

  bindAlias(params) {
    return new Promise((resolve, reject) => {
      gt.bindAlias(GeTuiConfig.APPID, params.uid, params.CID, (err, res) => {
        if(!err && 'ok' === res.result) return resolve({ code: 0, message: '绑定成功' })
        resolve({ code: Code.PUSH_ERR, message: CodeMsg[34016]})
      })
    })
  }
}

module.exports = new PushMessage()


/**
 * 个推调用 返回promise对象 用await或then取值
 */
const getui = require('./getui')

getui.pushMessage(message, 'transmission', 'pushMessageToApp') // 透传消息 推送给所有 

getui.pushMessage(message, 'link', 'pushMessageToApp') // 跳转链接 推送给所有

getui.pushMessage(message, 'notification', 'pushMessageToApp') // 通知消息 推送给所有

getui.pushMessage(message, 'transmission', 'pushMessageToList') // 透传消息 推送给分组 需要设置别名

getui.pushMessage(message, 'notification', 'pushMessageToList') // 通知消息 推送给分组 需要设置别名

```

## Contributors

 - qian.zhang

## MIT Licenced

