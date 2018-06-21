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
const DictionaryAlertMsg = require('getui2').DictionaryAlertMsg

const GETUICONFIG = {
  HOST: 'http://sdk.open.api.igexin.com/apiex.htm',
  APPID: '',
  APPKEY: '',
  MASTERSECRET: '',
},

const gt = new GeTui(GETUICONFIG.HOST, GETUICONFIG.APPKEY, GETUICONFIG.MASTERSECRET)

class PushMessage {
  constructor(message, targets, options) {
    this._message = message || {}
  }

  pushMessage(message, templateType, methodName) {
    switch (typeof message.uidList) {
      case 'string':
        message.uidList = JSON.parse(message.uidList || '[]')
        break
      case 'object':
        message.uidList = message.uidList
        break
      default:
        message.uidList = []
        break
    }

    const pushTargets = message.uidList.map((uid) => {
      return new Target({ appId: GETUICONFIG.APPID, alias: uid })
    })

    sails.log.info("GETUI PUSH MESSAGE UIDS:", pushTargets)

    const messageTemplate = this.setMessageTemplate(message, templateType)
    const messageConfig = this.setMessageConfig(messageTemplate, methodName)

    return this.choosePushFn(methodName, messageConfig, pushTargets)
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

  setMessageConfig(template, methodName) {
    switch (methodName) {
      case 'pushMessageToApp':
        return new AppMessage({
          isOffline: true,
          offlineExpireTime: 3600 * 12 * 1000,
          data: template,
          appIdList: [GETUICONFIG.APPID],
          speed: 10000,
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
          appIdList: [GETUICONFIG.APPID],
          speed: 10000
        })
    }
  }

  choosePushFn(methodName, ...args) {
    switch (methodName) {
      case 'pushMessageToList': {
        return this.pushMessageToList(...args)
      }
      case 'pushMessageToSingle': {
        return this.pushMessageToSingle(...args)
      }
      case 'pushMessageToApp':
      default: {
        return this.pushMessageToApp(...args)
      }
    }
  }

  pushMessageToApp(messageConfig, pushTargets) {
    return new Promise((resolve, reject) => {
      gt.pushMessageToApp(messageConfig, null, (err, res) => {

        sails.log.info("GETUI PUSH MESSAGE TO APP HAVE DONE:", res)

        if (!err && res && 'ok' === res.result) {
          return resolve({ code: 0, message: '推送成功' })
        }

        sails.log.info("GETUI PUSH MESSAGE TO APP HAVE ERR:", err)

        resolve({ code: 100000, message: '推送错误' })
      })
    })
  }

  pushMessageToList(messageConfig, pushTargets) {
    return new Promise((resolve, reject) => {
      gt.getContentId(messageConfig, null, (err, res) => {

        sails.log.info("GETUI PUSH MESSAGE TO LIST GET CONTENTID HAVE DONE:", res)

        gt.pushMessageToList(res, pushTargets, (err, res) => {

          sails.log.info("GETUI PUSH MESSAGE TO LIST HAVE DONE:", res)

          if (!err && res && 'ok' === res.result) {
            return resolve({ code: 0, message: '推送成功' })
          }

          sails.log.info("GETUI PUSH MESSAGE TO LIST HAVE ERR:", err)

          resolve({ code: 100000, message: '推送错误' })
        })
      })
    })
  }

  pushMessageToSingle(messageConfig, pushTargets) {
    return new Promise((resolve, reject) => {
      gt.pushMessageToSingle(messageConfig, pushTargets, (err, res) => {

        if (res && res.result === 'ok') {
          return resolve({ code: 0, message: '推送成功' })
        }

        sails.log.info("GETUI PUSH MESSAGE TO SINGLE HAVE DONE:", res)

        if (err && err.exception && err.exception instanceof RequestError) {
          const requestId = err.exception.requestId

          gt.pushMessageToSingle(messageConfig, pushTargets, requestId, (err, res) => {

            sails.log.info("GETUI PUSH MESSAGE TO SINGLE HAVE DONE:", res)

            if (!err && 'ok' === res.result) {
              return resolve({ code: 0, message: '推送成功' })
            }

            sails.log.info("GETUI PUSH MESSAGE TO SINGLE HAVE DONE:", err)

            resolve({ code: 100000, message: '推送错误' })
          })
        }
      })
    })
  }

  composeLinkMessage(message) {
    return {
      appId: GETUICONFIG.APPID,
      appkey: GETUICONFIG.APPKEY,
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
      appId: GETUICONFIG.APPID,
      appkey: GETUICONFIG.APPKEY,
      transmissionType: 2,
      transmissionContent: this.formatTransmissioMsg(message)
    }
  }

  composeAPNTransmissionMessage(message) {
    const template = new TransmissionTemplate(this.composeTransmissionMessage(message))
    const payload = new APNPayload()
    const alertMsg = new DictionaryAlertMsg()
    alertMsg.body = message.text
    alertMsg.title = message.title
    alertMsg.alertMsg = 'app推送'
    payload.alertMsg = alertMsg
    payload.badge = 1
    payload.contentAvailable = 1
    payload.category = "ACTIONABLE"
    payload.customMsg.payload1 = this.formatTransmissioMsg(message)
    template.setApnInfo(payload)
    return template
  }

  formatTransmissioMsg(message) {
    const getuiMsgTemlpate = {
      body: {
        text: message.text || 'app推送',
        title: message.title || 'app推送'
      },
      display_type: 'notification',
      extra: {
        jump: message.url || '',
        badge: 1
      }
    }
    return JSON.stringify(getuiMsgTemlpate)
  }

  bindAlias(params) {
    return new Promise((resolve, reject) => {
      gt.bindAlias(GETUICONFIG.APPID, params.uid || params.CID, params.CID, (err, res) => {
        sails.log(err, res, res.result)

        if (!err && res && 'ok' === res.result) {
          return resolve({ code: 0, message: '绑定成功' })
        }

        resolve({ code: 100000, message: '推送错误' })
      })
    })
  }

}

module.exports = new PushMessage()