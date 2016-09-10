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
	if (this.parentNode.id !== "new") {
		$.post('/keystone/api/dones/' + this.parentNode.id, { "doneType" : 1, createdBy: userId, completedOn: now.format('YYYY-MM-DD') }, function (response) { console.log(response)});
	}
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
	if (this.parentNode.id !== "new") {
		$.post('/keystone/api/dones/' + this.parentNode.id, { "doneType" : 3, createdBy: userId, completedOn: null }, function (response) { console.log(response)});
	}
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
	if (this.parentNode.id !== "new") {
		$.post('/keystone/api/dones/' + this.parentNode.id, { "doneType" : 2, createdBy: userId, completedOn: null }, function (response) { console.log(response)});
	}
  iconate(this, options);
  this.classList.remove('blocker');
  this.classList.add('goal');
  this.removeEventListener('click', blockerToGoal)
  this.addEventListener('click', goalToDone)
}

var startDate = getUrlParameter('start') || moment();
var endDate = getUrlParameter('end') || moment();

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
    "startDate": moment(startDate, "YYYYMMDD").startOf('day'),
    "endDate": moment(endDate, "YYYYMMDD").endOf('day'),
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
  window.location.assign("/dones?start=" + startDate + "&end=" + endDate);
});

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

/*$('.delete').click(function() {
	var id = this.parentNode.parentNode.id;
	$.ajax({
    url: '/keystone/api/dones/delete/' + id,
    type: 'DELETE',
    success: function(result) {
        console.log('result');
    }
	});
});*/

// Find all editable content.
$('[contenteditable=true]')
  .focus(function(e) {
		if ($(this).parent().attr("id") === "new") {
			window.setTimeout(function() {
      	$(e.target).text("")
	    }, 100);
		}
    $(this).data("initialText", $(this).text());
  })
  .blur(function() {
		var id = $(this).parent().attr("id");
		if (id === "new" && $(this).text() === '' ) {
			$(this).css('min-width', '');
			$(this).text('Add new done');
			return;
		}
    if ($(this).data("initialText") !== $(this).text()) {
			if (id === "new") {
				var type = 0;
				if ($(this).parent().children().eq(0).hasClass('done')) {
					type = 1;
				} else if ($(this).parent().children().eq(0).hasClass('goal')) {
					type = 2;
				} else {
					type = 3;
				}
				
				var completed = type === 1 ? moment().format('YYYY-MM-DD') : null;
				var payload = {};
				payload.text = $(this).text();
				payload.createdBy = userId;
				if (completed) {
					payload.completedOn = completed;
				}
				if (type > 0) {
					payload.doneType = type;
				}
				
				$.post('/keystone/api/dones/create', payload, function (response) { 
					var newDone = $('#new');
					var copyOfNewDone = $('#new').clone(true, true);
					newDone.attr('id', response.id);
					if (completed) {
						newDone.append('<small>Completed on ' + moment(response.completedOn).format('MMMM Do, YYYY') + ' - <span class="delete">Delete</span></small>');
					} else {
						newDone.append('<small>Created on ' + moment(response.createdOn).format('MMMM Do, YYYY') + ' - <span class="delete">Delete</span></small>');
					}
					$('.delete').click(deleteItem);
					newDone.after(copyOfNewDone);
					copyOfNewDone.children('span[contenteditable=true]').html('Add new done');
				});
			} else {
	      $.post('/keystone/api/dones/' + id, { 
					"text" : $(this).text(), 
					createdBy: userId
				}, function (response) { 
					console.log(response)
				});
			}
		}
	})
  .keypress(function(e) { 
		if (e.which === 13) {
			this.blur();
			return false;
		} 
		return true;
	});

$('.delete').click(deleteItem);

function deleteItem(e) {
	var id = e.target.parentNode.parentNode.id;
	console.log(id);
	$.post('/keystone/api/dones/' + id + '/delete', function(result) {
        console.log(result);
    });
	$(e.target.parentNode.parentNode).remove();
}