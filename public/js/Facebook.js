'use strict';

const hash = window.location.hash.substring(1),
      splitted = hash.split("/"),
      pageId = splitted[0],
      request = splitted[1],
      MONTHS = window.MONTHS = ['January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'];

console.log(splitted);

let handler;

class Facebook {
  constructor(accessToken){
	this.accessToken = accessToken;
	this.jobs = {};
    }

    metadata(id,options,cb){
	FB.api(
	    id,
	    options.method || 'GET',
	    _.extend(options, {
		metadata: 1,
		access_token: this.accessToken
	    }),
	    (response) => {
		if(_.isFunction(cb)){
		    cb(response);
		}
	    });
    }

    get(id, req, options, cb){
	FB.api(
	    [id, req].join('/'),
	    options.method || 'GET',
	    _.extend(options, {
		access_token: this.accessToken
	    }),
	    (response) => {
		console.log(response);
		if(!response || response.error){
		    if(_.isFunction(options.fail))
			options.fail(response.error);
		} else {
		    if(_.isUndefined(this.jobs[req])){
			this.jobs[req] = [];
		    };
		    _.size(response.data) && this.jobs[req].push(response.data);
		    if(response.paging && response.paging.next){
			_.each(new URL(response.paging.next).search.substring(1).split('&'),
			       (it) => {
				   var kv = decodeURI(it).split(/\=/);
				   options[kv[0]] = kv[1];
			       });
			//console.log(options);
			handler.get(id, req, options, cb);
		    } else {
			if(_.isFunction(cb)){
			    cb(_.reduce(this.jobs[req], (result, it) => { return result.concat(it); }));
			}
		    }
		}
	    }
	);
    }
};


// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {
    'packages': ['corechart']
});

handler = new Facebook('CAACEdEose0cBAPxtZAbZAAG2EhySZBZBmFLP3w6ZA9UeJedMoksQVkuNvrB14ZAbzlgTJ7MYqgFbBtVbLZBzJsGteqZAyMDop21Ow8FCYfUdjVGvUY6O6VHfBCxa9LXsGO4b6Ci8mnMI90gJuIacvjKBFnNPQYDa6caVZAGZCrNtpQMhAvqg0EAtUDdEuP7iur5m6VSeiVpeLrtwZDZD');

const go = () => {
    handler.get(pageId, 'posts', {
	since: new Date('2015/01/01').getTime() / 1000,
	limit: 100,
	fields: 'id,name,message,created_time,likes.limit(500),comments.limit(500),shares',
	include_hidden: true
    }, (results) => {
	var data = window.data = new google.visualization.DataTable();
	data.addColumn('string', 'id');
	data.addColumn('date', 'created_time');
	data.addColumn('string', 'message');
	data.addColumn('string', 'name');
	data.addColumn('string', 'userId');
	data.addColumn('number', 'likes');
	data.addColumn('number', 'comments');
	data.addColumn('number', 'shares');

	const rows = _.map(results, (it) => [
	    it.id,
	    new Date(it.created_time),
	    it.message,
	    it.name,
	    it.userId,
	    it.likes?_.size(it.likes.data):0,
	    it.comments?_.size(it.comments.data):0,
	    _.parseInt(it.shares?it.shares.count:'0') ]);

	console.log('Storing rows', rows);
	// Instantiate and draw our chart, passing in some options.
	data.addRows(rows);

	window.V = google.visualization;
	window.D = V.data;
	// Set chart options
	var charts = document.querySelectorAll('.chart');
	_.each(charts, (it) => {
	    const type = it.getAttribute('data-type')?it.getAttribute('data-type'):'BarChart',
		  data = eval(it.getAttribute('data-group')),
		  opts = eval('(' + it.getAttribute('data-opts') + ')'),
		  chart = new V[type](it);

	    chart.draw(data, opts);
	});
    });

};


//export default Facebook;
