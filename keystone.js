// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').config();
var mailin = require('mailin');
var keystone = require('keystone');

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

keystone.init({
  'name': 'WhatIDone',
  'brand': 'WhatIDone',

  'less': 'public',
  'static': 'public',
  'favicon': 'public/favicon.ico',
  'views': 'templates/views',
  'view engine': 'jade',

  'auto update': true,
  'session': true,
  'auth': true,
  'user model': 'User'
});

// Load your project's Models
keystone.import('models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js
keystone.set('locals', {
  _: require('lodash'),
  env: keystone.get('env'),
  utils: keystone.utils,
  editable: keystone.content.editable
});

// Load your project's Routes
keystone.set('routes', require('./routes'));

// Configure the navigation bar in Keystone's Admin UI
keystone.set('nav', {
  posts: ['posts', 'post-categories'],
  users: 'users',
  dones: 'dones'
});

// Start Keystone to connect to your database and initialise the web server

keystone.start();

// Mailing below

var Done = keystone.list('Done');
var User = keystone.list('User');

mailin.start({
  port: 25,
  disableWebhook: true // Disable the webhook posting.
});

/* Event emitted after a message was received and parsed. */
mailin.on('message', function (connection, data, content) {
  var sender = data.envelopeFrom.address;
  var dones = data.text;
  User.model.findOne({
    email: sender
  })
    .exec(function (err, user) {
      if (err) {
        console.log(err);
      }
      var createdBy = null;
      if (user) {
        createdBy = user.id;
      }

      dones = dones.split('\n');
      dones.map(function (done) {
        return done.trim();
      });

      dones = dones.filter(function (done) {
        if (done[0] === '>') {
          return false;
        }
        return done.length > 1;
      });

      dones.forEach(function (done) {
        var type = '1';
        if (done[0] === '[' && done[1].toLowerCase() !== 'x') {
          type = '2';
          done = done.split(']')[1].trim();
          if (!done) {
            return;
          }
        } else if (done[0].toLowerCase() === 'x' && done[1] === ' ') {
          type = '3';
          done = done.substr(2).trim();
        }

        if (done[0] === '[') {
          done = done.split(']')[1].trim();
        }

        if (type === 'done') {
          Done.model.find()
            .where('text', done)
            .exec(function (err, oldDones) {
              if (err) {
                console.log(err);
              }
              if (oldDones) {
                oldDones.filter(function (oldDone) {
                  return !oldDone.completedOn;
                });
              }

              if (oldDones.length === 1) {
                oldDones[0].completedOn = new Date();
                oldDones[0].doneType = '1';
                oldDones[0].save();
              } else {
                new Done.model({ // eslint-disable-line
                  text: done,
                  creator: sender,
                  isComplete: true,
                  completedOn: type === '1' ? new Date() : null,
                  doneType: type,
                  createdBy: createdBy
                }).save();
              }
            });
        } else {
          new Done.model({ // eslint-disable-line
            text: done,
            creator: sender,
            isComplete: true,
            completedOn: type === '1' ? new Date() : null,
            doneType: type,
            createdBy: createdBy
          }).save();
        }
      });
    });
});
// TODO: what happens with unknown sender?
