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
  'user model': 'User',
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
  editable: keystone.content.editable,
});

// Load your project's Routes
keystone.set('routes', require('./routes'));

// Configure the navigation bar in Keystone's Admin UI
keystone.set('nav', {
  posts: ['posts', 'post-categories'],
  users: 'users',
  dones: 'dones',
});

// Start Keystone to connect to your database and initialise the web server

keystone.start();

// Mailing below

var Done = keystone.list('Done');
var User = keystone.list('User');

mailin.start({
  port: 8001,
  disableWebhook: true // Disable the webhook posting.
});

/* Access simplesmtp server instance. */
mailin.on('authorizeUser', function (connection, username, password, done) {
  if (username == "johnsmith" && password == "mysecret") {
    done(null, true);
  } else {
    done(new Error("Unauthorized!"), false);
  }
});

/* Event emitted after a message was received and parsed. */
mailin.on('message', function (connection, data, content) {
  var sender = data.envelopeFrom.address;
  var dones = data.text;
  dones = dones.split('\n');
  dones = dones.filter(function (done) {
    if (done[0] === ">") {
      return false;
    }
    return done.length > 1;
  });
  dones.forEach(function (done) {
    var type = 'done';
    if (done[0] === "[" && done[1].toLowerCase() !== "x") {
      type = 'goal';
      done = done.split("]")[1];
      if (!done) {
        return;
      }
    } else if (done[0].toLowerCase() === "x" && done[1] === " ") {
      type = 'blocker';
      done.substr(2);
    }

    User.model.findOne()
      .where('email', sender)
      .exec(function(err, user) {
        var createdBy = null;
        if (user) {
          createdBy = user.id;
        }
        new Done.model({
          text: done,
          creator: sender,
          isComplete: true,
		      completedOn: new Date(),
          doneType: type,
          createdBy: user,
      }).save(done);
    });
  });
  /* Do something useful with the parsed message here.
   * Use parsed message `data` directly or use raw message `content`. */
});