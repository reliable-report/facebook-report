'use strict';

let a = 1;
var hash = window.location.hash.substring(1),
    splitted = hash.split("/"),
    pageId = splitted[0],
    request = splitted[1];

console.log(splitted);

const FacebookHandler = function(accessToken) {
    var _self,
	results = [];

    return _self = {
	feed: function(id, options) {
	    FB.api(
		id + "/" + request,
		options.method || 'GET',
		_.extend(options, {
		    access_token: accessToken
		}),
		function(response) {
		    if (!response || response.error) {
			options.fail(response.error);
		    } else {
			console.log(response);

			var event = {
			    "d": _.each(response.data, function(it) {
				it.pageId = id;
				if (it.created_time)
				    it.keen = {
					timestamp: new Date(it.created_time).toISOString()
				    }
			    })
				};

			event[request] = event.d;
			delete event.d;

			_.size(response.data) && results.push(response.data);
			console.log(_.size(results));
			if (response.paging && response.paging.next) {
			    _.each(new URL(response.paging.next).search.substring(1).split('&'),
				   function(it) {
				       var kv = it.split(/\=/);
				       options[kv[0]] = kv[1];
				   });
			    _self.feed(id, options);
			} else if (_.isFunction(options.success)) {
			    options.success(_.reduce(results, function(result, it) {
				return result.concat(it)
			    }));
			}
		    }
		}
	    )
	}
    }
}
// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {
    'packages': ['corechart']
});

var handler = new FacebookHandler('CAACEdEose0cBAHCPODHPt9TSv1WfdQXVaRdmArIeyyhlQBCcmc56B4Wzloq4zJPH0Y8c2V5QpepMbPCDIHNVxD6iMHqrNYXzR3CdIp3BfWBEjJtIdG7Qhe4aHtAh8yXfS4LfhePB1cZCZA4kRNoLMx1opXZC1QzfrlXyZBTczS09FbFrZCw2LYwpFENa33G7pZBPTgN2tqAgZDZD');

window.fbAsyncInit = function() {
    FB.init({
	appId: 'socibo.co',
	xfbml: true,
	version: 'v2.5'
    });

    google.setOnLoadCallback(go);
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
	return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

var go = function() {
    handler.feed('/' + pageId, {
	since: new Date("2015/01/01").getTime() / 1000,
	limit: 100,
	success: function(results) {
	    console.log(results);
	    var months = _.chain(results)
	        .groupBy(function(it) {
		    var d = new Date(it.created_time);
		    return d.getFullYear() + '-' + d.getMonth();
		})
	        .map(function(it, key) {
		    return [key, _.size(it)]
		})
	        .value();
	    // Create the data table.
	    var data = new google.visualization.DataTable();
	    data.addColumn('string', 'Months');
	    data.addColumn('number', 'Posts');

	    // Instantiate and draw our chart, passing in some options.
	    console.log(results, months);
	    data.addRows(months);
	    // Set chart options
	    var options = {
		'title': 'Number of postings per month',
		'width': '80%',
		'height': 300
	    };

	    // Instantiate and draw our chart, passing in some options.
	    var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
	    chart.draw(data, options);
	},
	fail: function(error) {
	    console.log(error);
	}
    });

}
  // Set a callback to run when the Google Visualization API is loaded.
