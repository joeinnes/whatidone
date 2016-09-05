$.ajaxSetup({
    headers: {
        'x-csrf-token': $('meta[name="csrf-token"]').attr('content')
    }
});

var userId = $('meta[name="user"]').attr('content');

var iconElements = document.getElementsByClassName('goal');
for (var i = 0; i < iconElements.length; i++) {
  iconElements[i].addEventListener('click', goalToDone);
}

iconElements = document.getElementsByClassName('done');
for (var i = 0; i < iconElements.length; i++) {
  iconElements[i].addEventListener('click', doneToBlocker);
}

iconElements = document.getElementsByClassName('blocker');
for (var i = 0; i < iconElements.length; i++) {
  iconElements[i].addEventListener('click', blockerToGoal);
}

function goalToDone() {
  var options = {
    from: 'fa-square-o',
    to: 'fa-check-square-o',
    animation: 'tada'
  };
	var now = moment();
	$.post('/keystone/api/dones/' + this.id, { "doneType" : 1, createdBy: userId, completedOn: now.format('YYYY-MM-DD') }, function (response) { console.log(response)});
  iconate(this, options);
  this.classList.remove('goal');
  this.classList.add('done');
  this.removeEventListener('click', goalToDone)
  this.addEventListener('click', doneToBlocker)
}

function doneToBlocker() {
  var options = {
    from: 'fa-check-square-o',
    to: 'fa-ban',
    animation: 'tada'
  };
	$.post('/keystone/api/dones/' + this.id, { "doneType" : 3, createdBy: userId, completedOn: null }, function (response) { console.log(response)});
  iconate(this, options);
  this.classList.remove('done');
  this.classList.add('blocker');
  this.removeEventListener('click', doneToBlocker)
  this.addEventListener('click', blockerToGoal)
}

function blockerToGoal() {
  var options = {
    from: 'fa-ban',
    to: 'fa-square-o',
    animation: 'tada'
  };
	$.post('/keystone/api/dones/' + this.id, { "doneType" : 2, createdBy: userId, completedOn: null }, function (response) { console.log(response)});
  iconate(this, options);
  this.classList.remove('blocker');
  this.classList.add('goal');
  this.removeEventListener('click', blockerToGoal)
  this.addEventListener('click', goalToDone)
}

$('#daterange').daterangepicker({
    "ranges": {
        "Today": [
            moment().startOf('day'),
            moment().endOf('day')
        ],
        "Yesterday": [
            moment().subtract(1, 'days').startOf('day'),
            moment().subtract(1, 'days').endOf('day')
        ],
        "Last 7 Days": [
            moment().subtract(7, 'days').startOf('day'),
            moment().endOf('day')
        ],
        "Last 30 Days": [
            moment().subtract(30, 'days').startOf('day'),
            moment().endOf('day')
        ],
        "This Month": [
            moment().startOf('month'),
            moment().endOf('day')
        ],
        "Last Month": [
            moment().subtract(1, 'months').startOf('month'),
            moment().subtract(1, 'months').endOf('month')
        ]
    },
    "alwaysShowCalendars": true,
    "startDate": moment().startOf('day'),
    "endDate": moment().endOf('day'),
    "opens": "center",
    "autoApply": true,
    "maxDate": moment().endOf('day'),
    "autoUpdateInput": true,
    "locale": {
      "format": 'DD/MM/YYYY'
    },
}, function(start, end, label) {
  console.log(start.format('YYYYMMDD') + ' ' + end.format('YYYYMMDD'));
}).show();

$('#go-to-dates').on('click', function() {
  var datePicker = $('#daterange').val();
  var startDate = datePicker.split(" ")[0];
  var endDate = datePicker.split(" ")[2];
  startDate = "" + startDate.split('/')[2] + startDate.split('/')[1] + startDate.split('/')[0]
  endDate = "" + endDate.split('/')[2] + endDate.split('/')[1] + endDate.split('/')[0]
  window.location.assign("/dones/" + startDate + "/" + endDate);
});
