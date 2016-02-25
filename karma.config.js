module.exports = function(config) {
  config.set({
    "frameworks" : [ "mocha" ],
    "files" : [
      "./src/vendors/angular.js",
      "./src/vendors/angular-*.js",
      "./dist/_static/templates.js",
      "./dist/client/**/*.spec.js"
    ],

    "preprocessors" :
        {"./dist/client/**/*.spec.js" : [ "webpack", "sourcemap" ]},

    "webpackMiddleware" : {"noInfo" : true},

    "reporters" : [ "progress" ],
    "port" : 9876,

    "colors" : true,
    "browsers" : [ "Firefox" ],

    "singleRun" : false
  });
};
