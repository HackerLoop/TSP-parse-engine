const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const _ = require('underscore');
const mongojs = require('mongojs');

const CURRENT_SET = (process.env.CURRENT_SET || 1);
const CHANNEL = (process.env.CHANNEL || 'hackerloop');
const MONGODB_URL = (process.env.MONGODB_URL || 'mongodb://localhost:27017/hackerloop');
const TESTMODE = process.env.TESTMODE || false;

global.db = mongojs(MONGODB_URL);


var tmi = require("tmi.js");
var options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: "hackerloop",
        password: "oauth:fkck47zva046kyip43ew2q0yqhm1bx"
    },
    // channels: ["#hanryang1125"]
    channels: [`${CHANNEL}`]
};
var client = new tmi.client(options);
// Connect the client to the server..
client.connect();

// Connection URL
const url = MONGODB_URL;
// Use connect method to connect to the Server
MongoClient.connect(url,{
    // retry to connect for 60 times
    reconnectTries: 60,
    // wait 1 second before retrying
    reconnectInterval: 100,
    autoReconnect : true
  }, function(err, db) {
  assert.equal(null, err);

  if(err) throw err;
  console.log("Connected correctly to MongoDB");

  // db.listCollections().toArray(function(err, collections){
  //   if (!_.contains(_.map(collections, db => (db.name)), 'vote')) {
  //     db.createCollection(
  //     'vote',
  //     {
  //       autoIndexId: true,
  //       strict: true,
  //     });
  //   }
  // });
  db.close();
});

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
const wait = function sl(ms) {
  let now = new Date().getTime();
  while (now + ms >= new Date().getTime()) {}
};

wait(2000);

const collections = {};
collections.vote = db.collection('vote');
collections.record = db.collection('record');

collections.vote.count({ set: CURRENT_SET, channel: CHANNEL }, function(error, count) {
  if (count === 0) {
    collections.vote.insert({ set: CURRENT_SET, channel: CHANNEL });
  }
});

const collection = db.collection('regprocess');
const results = collection.find({ set: CURRENT_SET }).toArray((err, docs) => {

  const arrayRules = {};
  docs.forEach((obj, values) => {
    let options = '';
    options += obj.insensitive === true ? 'i': '';
    options += obj.recursive === true ? 'g': '';

    const ruleName = (obj.type).capitalize();
    arrayRules[`rule${ruleName}`] = (message, user) => {
      const reg = new RegExp(obj.regex, options);
      if (message.match(reg)) {
        const result = (message.match(reg))[0];
        if (obj.type === 'vote') {
          const inc = {};
          inc[`choices.${result}`] = 1;
          console.log(`User ${user['display-name']} has voted!`);
          collections[obj.type].update({
            'set': CURRENT_SET,
            'channel': CHANNEL,
          }, {
            $inc: inc
          });
          // client.userstate['#hackerloop'] = {};
        }
        if (obj.type === 'record') {
          console.log(`User ${user['display-name']} has sent a playin'command!`);
          collections[obj.type].insert({
            'set': CURRENT_SET,
            'channel': CHANNEL,
            'command': `${result}`,
            user,
            createdAt: new Date()
          });
        }
      }
      return false;
    }
  });

  client.on('connected', function(address, port) {
    client.say(`${CHANNEL}`, 'Starting a new game...');
    client.say(`${CHANNEL}`, 'For vote type: fart or prout');
    client.say(`${CHANNEL}`, 'For playing type: w or s or d or a or j or k');
  });

  const makeRecord = () => {
    let text = '';
    const possible = 'wsadvb';
    for (let i = 0; i < 1; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const makeVote = () => {
    let position = '';
    const possible = ['fart', 'prout'];
    for (let i = 0; i < 1; i++) {
      position += Math.floor(Math.random() * possible.length);
    }
    return possible[position];
  };

  client.on("chat", function (channel, user, message, self) {
      if (user.mod) {
          // User is a mod.
      }
      if (TESTMODE) {
        arrayRules.ruleRecord(makeRecord(), user);
        console.log(makeRecord());
        arrayRules.ruleVote(makeVote(), user);
        console.log(makeVote());
      } else {
        arrayRules.ruleVote(message, user);
        arrayRules.ruleRecord(message, user);
      }
      // console.log( (new RegExp('^poongYuri$', 'ig')).test(message) );
  });
});
