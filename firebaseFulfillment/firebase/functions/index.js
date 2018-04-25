'use strict';

process.env.DEBUG = 'actions-on-google:*';

const { DialogflowApp } = require('actions-on-google');

const request = require('request');

const ACTION_SCORE = 'score';

const EXT_HEALTH_INSPECTOR_API_URL = 'https://ohi-api.code4hr.org';
const EXT_VENDOR = '/vendors';
const VENDOR_ARG = 'vendor';

const dialogflowFirebaseFulfillment = (req, res) => {
  const assistant = new DialogflowApp({request: req, response: res});
  console.log('healthInspectorAction Request headers: ' + JSON.stringify(req.headers));
  console.log('healthInspectorAction Request body: ' + JSON.stringify(req.body));

  function scoreHandler (assistant) {
    const vendor = assistant.getArgument(VENDOR_ARG);
    request(EXT_HEALTH_INSPECTOR_API_URL + EXT_VENDOR + '?name=' + vendor, function (error, response, body) {
      console.log('scoreHandler response: ' + JSON.stringify(response) + ' Body: ' + body + ' | Error: ' + error);
      const foo = JSON.parse(body);
      const vendors = Object.keys(foo);
      const score = foo[vendors[0]].score;
      const name = foo[vendors[0]].name;
      const msg = 'The restaurant ' + name + ' has a health rating score of ' + score.toFixed(0) + '.';
      assistant.ask(msg);
    });
  }

  // The Entry point to all our actions
  const actionMap = new Map();
  actionMap.set(ACTION_SCORE, scoreHandler);

  assistant.handleRequest(actionMap);
};

const functions = require('firebase-functions');
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(dialogflowFirebaseFulfillment);
