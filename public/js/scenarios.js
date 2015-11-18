var SCENARIOS = [
  {
    id: 'getUserInfo',
    path: '/me',
    scope: 'user_about_me,user_birthday,user_location,email,user_website,manage_pages,pages_show_list',
    fields: ["id","about","affiliation","app_id","app_links","artists_we_like","attire","awards","band_interests","band_members","best_page","bio","birthday","booking_agent","built","business","can_checkin","can_post","category","category_list","company_overview","contact_address","context","country_page_likes","cover","culinary_team","current_location","description","description_html","directed_by","display_subtext","emails","features","food_styles","founded","general_info","general_manager","genre","global_brand_page_name","global_brand_root_id","has_added_app","leadgen_tos_accepted","hometown","hours","influences","is_community_page","is_permanently_closed","is_published","price_range","is_unclaimed","is_verified","link","location","mission","mpg","name","network","new_like_count","offer_eligible","parent_page","parking","payment_options","personal_info","personal_interests","pharma_safety_info","phone","plot_outline","press_contact","produced_by","products","promotion_eligible","promotion_ineligible_reason","public_transit","record_label","release_date","restaurant_services","restaurant_specialties","schedule","screenplay_by","season","starring","store_number","studio","talking_about_count","engagement","single_line_address","place_type","unread_message_count","username","unread_notif_count","unseen_message_count","voip_info","website","were_here_count","written_by","owner_business","last_used_time","asset_score","checkins","likes","members"]

  },

  {
    id: 'getUserPosts',
    path: '/me/posts',
    fields: ["id","admin_creator", "application", "call_to_action", "caption", "created_time","description","feed_targeting", "from", "icon", "is_published", "is_hidden", "message", "message_tags", "link", "name", "object_id", "picture", "place", "privacy", "properties", "shares", "source", "status_type","story","story_tags", "targeting", "to", "type", "updated_time", "with_tags"]

  }
]
