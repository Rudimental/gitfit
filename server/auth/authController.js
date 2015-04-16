// Auth Controller
// ---------------
//
// The Auth controller handles requests passed from the User router.

var Q = require('q');
var request = require('request');
var keys = require('../config/secureAuth.js');
var $ = require('jquery');

var auth = {
  // This function assigns paramaters for an API request.
  assignReqParams: function(provider, usage, param){
    var call = provider + '-' + usage;    
    if (call === 'github-getRepos'){
      return {
        // param: (function(){console.log('inside', param)})(),
        url: 'https://api.github.com/users/' + param.github.user.username + '/repos',
        data: {access_token: param.github.accessToken},
        headers: {
          'User-Agent': 'GitFit',
          Authorization: 'token ' + param.github.accessToken
        }
      };
    }
    if (call === 'github-getCommits') {
      return {
        url: 'https://api.github.com/repos/' + param.github.user.username + '/' + param + '/commits?author=' + param.github.user.username,

        // we need to only get today's commits here by adding something like the following:
        // var formattedDate = YYYY-MM-DDTHH:MM:SSZ;
        
        //'&since=' + formattedDate;

        data: {access_token: param.github.accessToken},
        headers: {
          'User-Agent': 'GitFit',
          Authorization: 'token ' + param.github.accessToken
        }
      };
    }

    var paramStore = {
      
      'github-getToken': {
        uri: 'https://github.com/login/oauth/access_token',
        redirect_uri: 'http://localhost:8000',
        method: 'GET',
        body: {
          code: param,
          'client_id': keys.github.clientID,
          'client_secret': keys.github.clientSecret
        },
        json: true
      },

      'github-getUser': {
        headers: {
          'User-Agent': 'GitFit',
          Authorization: 'token ' + param
        },
        url: 'https://api.github.com/user',
      },

      'jawbone-getToken': {
        uri: 'https://jawbone.com/auth/oauth2/token?client_id=' + keys.jawbone.clientID + 
          '&client_secret=' + keys.jawbone.clientSecret + 
          '&grant_type=authorization_code' +
          '&code=' + param,
      },

      'jawbone-getUser':{
        url: 'https://jawbone.com/nudge/api/v.1.1/users/@me',
        headers: {'Authorization': 'Bearer ' + param},  
      }
    };

    return paramStore[call];
  },

  // Save a new user in our database
  getTokenFromCode: function(req, res, next){
    var userAccounts = req.query.accountCodes;
    var tokenParams = auth.assignReqParams('github', 'getToken', userAccounts.github.code);
    var fitnessParams = auth.assignReqParams(userAccounts.fitness.provider, 'getToken', userAccounts.fitness.code);
    var deferredGet = Q.nfbind(request);

    deferredGet(tokenParams)
      .then(function(body){
        userAccounts.github.accessToken = body[0].body.access_token;
        return userAccounts;
      })
      .then(function(userAccounts){
        deferredGet(fitnessParams)
          .then(function(body){
            userAccounts.fitness.accessToken = JSON.parse(body[0].body).access_token;
            return userAccounts;
        })        
          // get user info from github 
          .then(function(userAccounts){
            var githubUserParams = auth.assignReqParams('github', 'getUser', userAccounts.github.accessToken);
            deferredGet(githubUserParams)
              .then(function(body){
                var parsedBody = JSON.parse(body[0].body);
                // console.log('JSON.Parse: body[0].body', JSON.parse(body[0].body));
                userAccounts.github.user = {
                  id: parsedBody.id,
                  username: parsedBody.login,
                  name: parsedBody.name,
                  repos: parsedBody.repos_url
                };
                return userAccounts;
              })
              .then(function(userAccounts){
                var githubUserParams = auth.assignReqParams('github', 'getRepos', userAccounts);
                // deferredGet(githubUserParams);
                  deferredGet(githubUserParams)
                  .then(function(body){
                    // console.log(JSON.parse(body[0].body));

                    var reposList = [];
                    var commits = 0;

                    JSON.parse(body[0].body).forEach(function(repo){
                      reposList.push(repo.name);
                    });

                    reposList.forEach(function(repo) {
                      console.log('repo', repo);

                      // assign reqParams for repo
                      var repoParams = auth.assignReqParams('github', 'getCommits', repo);

                      // call get on repo
                      deferredGet(repoParams);
                      console.log('line 136');
                      
                      // go through commits 
                    })
                    // .then(function(x){
                    //   console.log('x', x);
                    // })
                    // userAccounts.github.reposList = reposList;
                  });
                  console.log('line 144!');
                  // return userAccounts;
                })
              // .then(function(userAccounts){
              //   console.log(userAccounts);
              //   console.log('JSON.parse(x[0]["body"])', JSON.parse(x[0]["body"]));


              //   // console.log('Saved user repos: ', reposList);
              //   // console.log('Confirm via log User');

              // });

              // for each commit, they're stored by author - add those that have your username

              // get overall steps from jawbone - adapt from app.jsx

              // get user info from jawbone
              // .then(function(userAccounts){
              //   var fitnessUserParams = auth.assignReqParams(userAccounts.fitness.provider, 'getUser', userAccounts.fitness.accessToken);
              //   deferredGet(fitnessUserParams)
              //     .then(function(body, req){
              //       var parsedBody = JSON.parse(body[1]);
              //       console.log('parsedBody', parsedBody);
              //       // userAccounts.fitness.user = {
              //       // xid: parsedBody.data.xid,
              //       // name: parsedBody.name
              //       // };
              //     });
              // })
              // .then(function(userAccounts){
              //   console.log('userAccounts', userAccounts);
              // }); 
          });
      });

    // .then()
    // get user info from fitnessProvider
    // .then()
    // save user in database by github unique id if info from both services is available
    // .then()
    // deferred.resolve(req.query.accountCodes);

  },

  getRequest: function(param, cb){
    request(param, function(err, res, body){
      if(err) {
        console.log(err);
      } else {
        console.log('DOING A GET REQUEST WITH THESE PARAMATERS:', param);
        cb(body);
      }
    });
  },

};

module.exports = auth;