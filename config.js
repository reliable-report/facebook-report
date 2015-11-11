// Copyright 2015, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';


module.exports = {
  port: process.env.PORT || 8080,

  // Secret is used by sessions to encrypt the cookie.
  secret: 'someSecret',

  // dataBackend can be 'datastore', 'cloudsql', or 'mongodb'. Be sure to
  // configure the appropriate settings for each storage engine below.
  // If you are unsure, use datastore as it requires no additional
  // configuration.
  dataBackend: 'datastore',

  // This is the id of your project in the Google Developers Console.
  gcloud: {
    projectId: 'reliable-report'
  },

  // Typically, you will create a bucket with the same name as your project ID.
 cloudStorageBucket: 'reliable-report',

  mysql: {
    user: 'your-mysql-user',
    password: 'your-mysql-password',
    host: 'your-mysql-host'
  },

  mongodb: {
    url: 'mongodb://localhost:27017',
    collection: 'books'
  },

  // The client ID and secret can be obtained by generating a new web
  // application client ID on Google Developers Console.
  oauth2: {
    clientId: '432168918177-gl0dcv3egnrgds6qg2vsmni8qloeveae.apps.googleusercontent.com',
    clientSecret: 'WRrF_Uyz7pOBpS4tyci02lPW',
    redirectUrl: process.env.OAUTH2_CALLBACK || 'http://localhost:8080/oauth2callback',
    scopes: ['email', 'profile']
  },
};
