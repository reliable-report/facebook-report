'use strict';

let keenClient;
class Api {
  constructor(apiKey){
    this.apiKey = apiKey;
  }
}

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

  api(path, method, options, callback){
    if(options.fields){
      FB.api(path, method, _.extend(options, {access_token: this.apiKey}), callback);
    } else {
      FB.api(path, method, _.extend(options, {
        access_token: this.apiKey,
        metadata:true
      }), (response) => {
        if(response && response.metadata){
          const fields = _.map(response.metadata.fields, _.property('name'));
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
    facebookApi = new FacebookApi('CAACEdEose0cBAB1GAVhuMZCRzvjJlAghywMKAvhZCYZCCORtcGut2K6vUFLf88hhfhtXKNkzhYSKzON40noIF03DCN1KjYMxOza8zHX9WqySc3A7SupDMLG2K5dz3teGIMYY6i2PVfDMAjyL9DuNeXm3B1w0FlOhJekDykQ9gPQcZC1xn8zroF8Ln3dV07kZD');

    var object = {
      posts: []
    };

    const mergeResults = (response, root, done) => {
      console.log(root.length);
      if(response && response.error){
        console.log(response.error);
      } else {
        Array.prototype.push.apply(root, response.data); // can't use concat here, as we need root mutation

	      if(response.paging && response.paging.next){
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
          facebookApi.api(path, 'GET', options, (response) => {
            mergeResults(response, root, done);

          });
	      } else {
          done(root);
        }
      }
    }

    let pageId;
    facebookApi.api('/me', 'GET', {
      fields: undefined,
//["id","about","affiliation","app_id","app_links","artists_we_like","attire","awards","band_interests","band_members","best_page","bio","birthday","booking_agent","built","business","can_checkin","can_post","category","category_list","company_overview","contact_address","context","country_page_likes","cover","culinary_team","current_location","description","description_html","directed_by","display_subtext","emails","features","food_styles","founded","general_info","general_manager","genre","global_brand_page_name","global_brand_root_id","has_added_app","leadgen_tos_accepted","hometown","hours","influences","is_community_page","is_permanently_closed","is_published","price_range","is_unclaimed","is_verified","link","location","mission","mpg","name","network","new_like_count","offer_eligible","parent_page","parking","payment_options","personal_info","personal_interests","pharma_safety_info","phone","plot_outline","press_contact","produced_by","products","promotion_eligible","promotion_ineligible_reason","public_transit","record_label","release_date","restaurant_services","restaurant_specialties","schedule","screenplay_by","season","starring","store_number","studio","talking_about_count","engagement","single_line_address","place_type","unread_message_count","username","unread_notif_count","unseen_message_count","voip_info","website","were_here_count","written_by","owner_business","last_used_time","asset_score","checkins","likes","members"]
      metadata:true

    }, (response) => {
      var fields = _.map(response.metadata.fields,_.property('name'));
      console.log('Fields captured:', fields);
      _.extend(object, response);
      keenClient.addEvent("pages", object, (err, res) => {
        if(err) {
          console.log(err);
        } else {
          console.log(res);
        }
      });
    });

    facebookApi.api('/me/posts', 'GET', {
      //fields: ['likes.limit(100)','comments.limit(100)','shares','message','link','admin_creator','caption','created_time','description','from','full_picture','icon','id','attachments.limit(100){description,description_tags}'],

      fields: undefined,
//["id","admin_creator", "application", "call_to_action", "caption", "created_time","description","feed_targeting", "from", "icon", "is_published", "is_hidden", "message", "message_tags", "link", "name", "object_id", "picture", "place", "privacy", "properties", "shares", "source", "status_type","story","story_tags", "targeting", "to", "type", "updated_time", "with_tags"]
      limit: 100,
      include_hidden: true,
    }, (response) => {
      const done = (obj) => {
        console.log('Final object:', obj);
        _.each(object.posts, (it) => {
          it.keen = {
            timestamp: new Date(it.created_time).toISOString()
          };
          it.pageId = object.id;

        });
        keenClient.addEvents({"posts": object.posts}, (err, res) => {
          if(err) {
            console.log(err);
          } else {
            console.log(res);
          }
        });
      };
      mergeResults(response, object.posts, done);
    });

  }
});
