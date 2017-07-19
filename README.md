## Installation

`npm install getui2`

## Tests

`npm test`

## Examples :

```bash
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
 * GeTuiConfig.HOST GeTuiConfig.APPKEY GeTuiConfig.MASTERSECRET
 */
const gt = new GeTui(GeTuiConfig.HOST, GeTuiConfig.APPKEY, GeTuiConfig.MASTERSECRET)
```

## Contributors

 - qian.zhang

## MIT Licenced

