var keystone = require('keystone');
var async = require('async');

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;

  // Init locals
  locals.section = 'dones';
  /* locals.filters = {
    date: req.params.category,
  }; */
  locals.data = {
    dones: []
  };

  // Load the dones
  view.on('init', function (next) {

    var q = keystone.list('Done').paginate({
      page: req.query.page || 1,
      perPage: 10,
      maxPages: 10
      /* filters: {
        state: 'published' // Date filter here?
      }, */
    })
      .sort('-doneType -completedOn')
      .populate('createdBy');

    q.exec(function (err, results) {
      locals.data.dones = results;
      next(err);
    });
  });

  // Render the view
  view.render('dones');
};
