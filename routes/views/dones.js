var keystone = require('keystone');
var async = require('async');
var moment = require('moment');

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;
  console.log(req.user._id);
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
    var end = moment().endOf('day')
    var start = moment(end).subtract(5, 'days');
    var q = keystone.list('Done')
      .paginate({
        page: req.query.page || 1,
        perPage: 10,
        maxPages: 10
        /* filters: {
          'createdBy.id': req.user._id
        }*/
      })
      .populate('createdBy')
      .sort('-doneType -completedOn');

    q.find({
      $and: [{
        createdBy: {
          _id: req.user._id
        }
      }, {
        $or: [{
          completedOn: {
            $gte: start,
            $lt: end
          }
        }, {
          completedOn: null
        }]
      }]
    });

    q.exec(function (err, results) {
      locals.data.dones = results;
      next(err);
    });
  });

  // Render the view
  view.render('dones');
};