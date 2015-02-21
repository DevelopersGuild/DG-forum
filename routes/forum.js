'use strict';

// TODO: Clean up this code
// TODO: Add checks to prevent abuse
module.exports = function(app) {

  var moment    = require('moment');
  var validator = require('validator');

  var Thread  = require('.././models/thread');

  // Conver timestamps into readable human time
  var convertToDate = function(timeStamp) {

      return moment(timeStamp).fromNow();
  };

  var handleForumFetch = function(req, res) {

    // Refresh the user's session expiration date if they view the forums
    // so that active users can continuously use the forums
    if (req.session.user) {

      // 1 week
      var week = 1000 * 60 * 60 * 24 * 7;

      // Set the session to expire in a week
      req.session.cookie.expires = new Date(Date.now() + week);
    }

    // Grab all threads.
    Thread.getAll(function(err, doc) {

      if (err) {
        res.send(err);
        return;
      }

      var templateVars = {
        title: '',
        threads: doc,
        convertToDate: convertToDate,
        sessUser: req.session.user
      };


      // Render template
      res.render('forum.html', templateVars);
    });
  };

  var handleThreadFetch = function(req, res) {

    // Find the thread
    var threadID = validator.toString(req.params.id);

    if (!threadID) {
      var result = {
        code    : 400,
        message : 'Thread not found.'
      };

      res.send(result);
      return;
    }

    Thread.get(threadID, function(err, doc) {
      if (err) {
        res.send(err);
        return;
      }

      var templateVars = {
        title: doc.subject,
        thread: doc,
        convertToDate: convertToDate,
        sessUser: req.session.user
      };

      // Render template
      res.render('thread.html', templateVars);
    });
  };

  var handleThreadCreate = function(req, res) {
    var subject = validator.toString(req.body.subject);
    var message = validator.toString(req.body.message);

    // TODO: Replace this with the actual name of the author
    var author = req.session.user.username;

    //var author = req.session.author;
    var result;

    if (!author) {
      result = {
        code    : 400,
        message : 'You are not logged in.'
      };
      res.send(result);
      return;
    }

    if (!subject) {
      result = {
        code    : 400,
        message : 'Title may not be blank.'
      };
      res.send(result);
      return;
    }

    // Check to see if the title length is between 1-85 characters
    if (!validator.isLength(subject, 1, 85)) {
      result = {
        code    : 400,
        message : 'Title cannot be more than 85 characters.'
      };
      res.send(result);
      return;
    }

    if (!message) {
      result = {
        code    : 400,
        message : 'Message body may not be blank.'
      };
      res.send(result);
      return;
    }

    Thread.create(subject, message, author, function(err, result, doc) {

      if (err) {

        res.send(result);

        return console.error(err);
      } else {

        console.log('New thread created');
        res.send({
          code: 200,
          message: 'Thread successfully created.'
        });
      }

    });
  };

  var handleThreadReply = function(req, res) {

    var threadID = validator.toString(req.params.id);

    var message = validator.toString(req.body.message);

    var author = req.session.user.username;

    var result;

    if (!author) {
      result = {
        code    : 400,
        message : 'You are not logged in.'
      };
      res.send(result);
      return;
    }

    if (!threadID) {
      result = {
        code    : 400,
        message : 'Thread not found.'
      };
      res.send(result);
      return;
    }

    if (!message) {
      result = {
        code    : 400,
        message : 'Message body cannot be empty.'
      };
      res.send(result);
      return;
    }

    Thread.makeReply(threadID, message, author,
      function(err, doc) {
        if (err) {
          res.send(err);
          return;
        }
        res.send({
          code: 200,
          message: 'Reply successfully created.'
        });
      }
    );
  };

  app.get('/'                 , handleForumFetch);
  app.post('/makethread'      , handleThreadCreate);
  app.get('/thread/:id'       , handleThreadFetch);
  app.post('/thread/:id/reply', handleThreadReply);

};
