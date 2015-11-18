'use strict';

let keenClient;
class Api {
  constructor(apiKey){
    this.apiKey = apiKey;
  }
}

const FIELDS_TO_EXCLUDE = ['ad_campaign'];

class FacebookApi extends Api{
  constructor(apiKey){
    super(apiKey);
    console.log('FacebookApi initialized with', this.apiKey);
    FB.init({
      access_token: this.apiKey,
      appId: '721619241271066',
      cookie: true,
	    xfbml: true,
      version:'v2.5'});
  }

  api(path, method, options, fields, connections, callback){
    if(options.fields){
      FB.api(path, method, _.extend(options, {access_token: this.apiKey}), callback);
    } else {
      FB.api(path, method, _.extend(options, {
        access_token: this.apiKey,
        metadata:true
      }), (response) => {
        if(response && response.metadata){
          fields && _.assign(fields, _.map(response.metadata.fields, _.property('name')));
          _.remove(fields, (it) => { return _.indexOf(FIELDS_TO_EXCLUDE, it) > -1 }); // removing some fields
          connections && _.assign(connections, _.map(response.metadata.connections, (it, name) => { var o = {};o[name] = it;return o}));
          FB.api(path, method, _.extend({
            access_token: this.apiKey,
            fields: fields
          }), callback);
        } else {
          callback(response);
        }
      });
    }
  }
};

window.addEventListener = window.addEventListener?window.addEventListener:attachEvent
let facebookApi;
window.addEventListener('message', (event) => {
  if(event.data === 'fbInitCompleted'){
    keenClient = new Keen({
      projectId: "5649d7b496773d0947a19ac1",
      writeKey: "3f70518b00d6935738d57cc599388a8f52c92ab6cef65529d883aa856aa290c0ba2d3943fb2d3a5d20851192c52be10334146036be5c01b85d27fae7be0e18cc954bf241121893d722f6f361f74747ab9131ae9e8452fe9dfe4a58f50edc70f4e35f35783d1417a3989b82f91f68d09f",
      readKey: "8b06b1bc11d027f6e79e9bc596754328c03299aaa037b3123f5edf99e677349862f04f5b049adcb9dfd98b9a2d9bd4effb3f08d858676874d64d744a151bc0aee8b72f97cd08b5c07ab153b56565b5159badecd7340cd9dae09cfc86de2b855783e89ee901ee98fea46435c7cd9e821f",
      masterKey: "1D3E38BDCAF9980C661296A29882AEE3",

      batchEventInserts: 500
    });

  } else
  if(event.data === 'fbLoginCompleted'){
    facebookApi = new FacebookApi('CAACEdEose0cBABQ7YwyM2YLtbNBZBMBwOq6VYIQr7y0uvhJMqIDkX9WQX836kFgCPHZCs361mbToND2HpK50aMbF3Rkq8iWVpTPaHJyNtOwDQmhjdQL1z1ATsvMVQLRTzpTVejWBhZA47kZCWInvjDfZBAewncZC2OppAvSkJZCIUgrXWfufvqhnhH1T6Isab6hlbLp8zZAncAZDZD');

    var object = {
      posts: []
    };

    const mergeResults = (response, root, done) => {
      console.log(root.length);
      if(response && response.error){
        console.log(response.error);
      } else {
        Array.prototype.push.apply(root, response.data); // can't use concat here, as we need root mutation

	      if(response.paging && response.paging.next && response.data.length){
          const url = new URL(response.paging.next),
		            // FIXME: optimize through substring
		            path = '/' + url.pathname.split(/\//).slice(-2).join('/'), // /v2.5/188091631526192/posts -> /188091631526192/posts
		            optsArr = unescape(url.search.substring(1)).split(/\&/),
                opts = _.map(optsArr, (it) => {
                  const s = it.split(/\=/),
			                  o = {};
                  o[s[0]] = s[1];
                  return o
		            }),
                options = _.reduce(opts, function(memo, current) { return _.extend(memo, current) },  {});
          facebookApi.api(path, 'GET', options, undefined, undefined, (response) => {
            mergeResults(response, root, done);

          });
	      } else {
          done(root);
        }
      }
    }

    let pageId, fields = [], connections = [];
    facebookApi.api('/me', 'GET', {
      metadata:true
    }, fields, connections, (response) => {
      console.log('Fields captured:', fields);
      console.log('Connections captured:', connections);
      _.extend(object, response);
      keenClient.addEvent("pages", object, (err, res) => {
        if(err) {
          console.log(err);
        } else {
          console.log(res);

          _.each(connections, (obj) => {
            // FIXME hate that, optimize
            const name = _.keys(obj)[0],
            	  con = new URL(_.values(obj)[0]).pathname;

            object[name] = [];
            facebookApi.api(con, 'GET', {
            	metadata: true
            }, fields, connections, (response) => {
              const done = (obj) => {
                console.log('Final object:', obj);
                _.each(object[name], (it) => {
                  it.keen = {};
                  //it.keen.id = it.id?it.id:undefined;
                  it.keen.timestamp = it.created_time?new Date(it.created_time).toISOString():undefined;
                  it.pageId = object.id;
                });
                const event = {};
                event[name] = obj;
                keenClient.addEvents(event, (err, res) => {
                  if(err) {
                    console.log(err);
                  } else {
                    console.log(res);
                  }
                });
              };
              mergeResults(response, object[name], done);
            });
          })
        }
      });
    });
    window.object = object;
  }
});
