'use strict';

const EXCLUDED_FIELDS = ['token_for_business'];

let $container;
document.onreadystatechange = (e) => {
  console.log(document.readyState);

  if(document.readyState === 'complete'){
	  $container = new Isotope(document.querySelector('.isotope'), {
	    itemSelector: 'a',
	    getSortData: {
		    likes: '[data-likes] parseInt',
		    comments: '[data-comments]',
		    shares: '[data-shares]'
	     },
	    sortAscending: {
		    likes: false
	    }
	  });

	  const peopleEl = document.getElementById('people'),
	        id = peopleEl.getAttribute('data-me');

	  const getMetadata = (path, cbFields, cbConnections, cbData) => {
	    FB.api(path, 'GET', {
		    metadata:1
	    }, (response) => {
		    if(response && !response.error){
          if(response.metadata){
		        if(_.isFunction(cbFields))
			        cbFields(path, response.metadata.fields, (r) => {
                console.log('Fields processed', path, r);
              })

		        if(_.isFunction(cbConnections))
			        cbConnections(path, response.metadata.connections, (r) => {
                console.log('Connections processed', path, r);
              })
          } else {
		        if(_.isFunction(path, cbData))
			        cbData(response.data, (r) => {
                console.log('Data processed', path, r);
              })
          }
		    } else
		      console.log('Error received processing:', path,  response);
	    });
	  };

    const processMetadataFields = (path, fields, cb) => {
      const passingFields = _.chain(fields).map(_.property('name')).xor(EXCLUDED_FIELDS).value();
		  console.log('Fields:', _.each(passingFields, (it) => { console.log(it) }));

      FB.api(path, 'GET', {fields: passingFields}, cb);
    }

	  const processMetadataConnections = (path, connections) => {
		  console.log('Connections:', connections);

	    _.each(connections, (connection, name) => {
		    const url = new URL(connection),
		          path = url.pathname;
		    console.log('Processing metadata for', name, path);
		    getMetadata(path, processMetadataFields, processMetadataConnections, processData);
	    });
	  };

    const processData = (path, data, cb) => {
      console.log('Data:', data);
      _.call(cb, data);
    }

	  getMetadata('/me', processMetadataFields, processMetadataConnections, processData);

	  const fbByPath = (path) => {

	    FB.api([id,'feed'].join('/'), {
		    fields:['id', 'name', 'likes', 'comments', 'shares'],
		    limit: 100,
		    access_token: ACCESS_TOKEN
	    }, (response) => {
		    var likes = _.chain(response.data)
		        .map(_.property('likes.data'))
		        .flatten()
		        .map(_.property('id'))
		        .map(_.parseInt)
		        .countBy()
		        .value();

		    var num = 0;
		    _.each(likes, (count, id) => {
		      var el = document.createElement('a');
		      el.id = id;
		      el.setAttribute('data-likes', count);
		      const endpoint = ['', id].join('/');
		      FB.api(endpoint,  {
			      fields:['id','name','picture'],
			      access_token: ACCESS_TOKEN },
			           (it) => {
			             if(it.picture){
				             const img = document.createElement('img');
				             el.title = [it.name, count].join(' // ');
				             el.href = it.id;
				             img.src = it.picture.data.url;
				             el.appendChild(img);
			             }
			             if(++num >= _.size(likes)){
				             $container.arrange({
				               sortBy: 'likes'
				             });
			             }

			           });
		      peopleEl.appendChild(el);
		      $container.appended(el);
		    });

		    document.querySelector('.sort-by-button-group').onclick = (e) => {
		      $container.arrange({ sortBy: e.target.getAttribute('data-sort-by') });
		    }

	    });

	  }
  }
};
