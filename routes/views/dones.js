var keystone = require('keystone');
var async = require('async');
var moment = require('moment');

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;
	var csrfTokenKey = keystone.security.csrf.TOKEN_KEY;
  var csrfTokenValue = keystone.security.csrf.getToken(req, res);
  // Init locals
  locals.section = 'dones';
  locals.data = {
    dones: []
  };

	var end = moment().endOf('day');
	var endAsDate = end.toDate();
  var start = moment(end).subtract(5, 'days');
	var startAsDate = start.toDate(); 

  if (req.params.start && moment(req.params.start, "YYYYMMDD").isValid()) {
    start = moment(req.params.start, "YYYYMMDD").startOf('day');
		startAsDate = start.toDate(); 
  }

  if (req.params.start && moment(req.params.end, "YYYYMMDD").isValid()) {
    end = moment(req.params.end, "YYYYMMDD").endOf('day');
		endAsDate = end.toDate();
  }

  // Load the dones
  view.on('init', function (next) {
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
		
    if (moment().format("YYYYMMDD") === req.params.end) {
			q.find({
      	$and: [{
       		createdBy: {
         		_id: req.user._id
       		}
      	}, {
       		$or: [{
         		completedOn: {
           		$gte: startAsDate,
           		$lt: endAsDate
         		}
       		}, {
         		completedOn: null
       		}]
      	}]
    	});
		} else {
			q.find({
				$and: [{
					createdBy: {
         		_id: req.user._id
       		}
      	}, {
					completedOn: {
          	$gte: startAsDate,
          	$lt: endAsDate
         	}
				}]
			});
		}

    q.exec(function (err, results) {
      locals.data.dones = results;
      next(err);
    });
  });

  // Render the view
  view.render('dones', {
    csrfTokenKey: csrfTokenKey, 
    csrfTokenValue: csrfTokenValue,
		logged_in_user: req.user._id
  });
};