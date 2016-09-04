var keystone = require('keystone');

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;

  // Set locals
  locals.section = 'dones';
  locals.filters = {
    done: req.params.done,
  };
  locals.data = {
    dones: [],
  };

  // Load the current post
  view.on('init', function (next) {

    var q = keystone.list('Done').model.findOne({
      id: locals.filters.done,
    })
      .populate('createdBy')
      .exec(function (err, result) {
        locals.data.done = result;
        next(err);
      });
  });

  // Load other posts
  view.on('init', function (next) {

    var q = keystone.list('Done').model.find()
      .sort('-createdOn')
      .populate('createdBy')
      .limit('4');

    q.exec(function (err, results) {
      locals.data.dones = results;
      next(err);
    });

  });

  // Render the view
  view.render('done');
};
