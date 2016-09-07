var keystone = require('keystone');
var async = require('async');
var moment = require('moment');

exports = module.exports = function(req, res) {
	var view = new keystone.View(req, res);
	var locals = res.locals
	locals.section = 'dones';
	locals.data = {
		dones: []
	};
	if (!req.user) {
		view.render('dones');
		return;
	}
	var csrfTokenKey = keystone.security.csrf.TOKEN_KEY;
	var csrfTokenValue = keystone.security.csrf.getToken(req, res);

	var end = req.query.end ? moment(req.query.end, "YYYYMMDD").endOf('day') : moment().endOf('day');
	var start = req.query.start ? moment(req.query.end, "YYYYMMDD").startOf('day') : moment(end).subtract(5, 'days').startOf('day');
	var endDate = end.toDate();
	var startDate = start.toDate();

	// Load the dones
	view.on('init', function(next) {
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

		if (moment().format("YYYYMMDD") === end.format("YYYYMMDD")) {
			q.find({
				$and: [{
					createdBy: {
						_id: req.user._id
					}
				}, {
					$or: [{
						completedOn: {
							$gte: startDate,
							$lte: endDate
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
						$gte: startDate,
						$lte: endDate
					}
				}]
			});
		}

		q.exec(function(err, results) {
			locals.data.dones = results;
			next(err);
		});
	});

	// Render the view
	view.render('dones', {
		csrfTokenKey: csrfTokenKey,
		csrfTokenValue: csrfTokenValue,
		logged_in_user: req.user._id,
		start: start.format("DD/MM/YYYY"),
		end: end.format("DD/MM/YYYY")
	});
};