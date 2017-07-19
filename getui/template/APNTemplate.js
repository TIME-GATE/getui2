/**
 * iOS模板
 */
'use strict';
var util = require('util');
var BaseTemplate = require('./BaseTemplate');
function APNTemplate(options) {
    BaseTemplate.call(this, options);
}

util.inherits(APNTemplate, BaseTemplate);

module.exports = APNTemplate;