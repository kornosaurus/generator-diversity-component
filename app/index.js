var generators        = require('yeoman-generator');
var changeCase        = require('change-case');
var fs                = require('fs');
var chalk             = require('chalk');
var child_process = require('child_process');
var request = require('request');

module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments);
    this.argument('compname', {type: String, required: false});
  },

  initializing: function() {
    var self = this;

    this.files        = this.fs.readJSON(this.sourceRoot() + '/files.json');
    this.newdir       = false;
    if (this.compname) {
      this.appname = this.compname;
      this.newdir  = true;
    }

    this.appname = changeCase.paramCase(this.appname);

    // Use the latest version of tws-api and tws-bootstrap
    var done = this.async();
    var waitingForDependencies = {
      'tws-api': false,
      'tws-bootstrap': false
    };
    var gotDependency = function(dependency) {
      delete waitingForDependencies[dependency];
      if (Object.keys(waitingForDependencies).length === 0) {
        done();
      }
    };

    request('https://diversity.io/components/tws-api/*',
      function(error, response, json) {
        if (!error && response.statusCode === 200) {
          self.apiVersion = '^' + JSON.parse(json).version;
        }
        gotDependency('tws-api');
      }
    );

    request('https://diversity.io/components/tws-bootstrap/*',
      function(error, response, json) {
        if (!error && response.statusCode === 200) {
          self.bootstrapVersion = '^' + JSON.parse(json).version;
        }
        gotDependency('tws-bootstrap');
      }
    );
  },

  writing: function() {
    var split    = this.appname.split('-');
    var filename = this.appname;
    var key      = 0;

    //if this is a native component we need another filename
    filename = filename.replace(/^tws-/, '');
    filename = changeCase.camelCase(filename);

    //Let's format the component name to our needs
    this.title     = changeCase.sentenceCase(this.appname.replace(/^tws-/, ''));
    this.title     = changeCase.upperCaseFirst(this.title);
    this.camelname = changeCase.camelCase(this.appname);

    //if we need a new directory, set path
    this.projectdir   = '';
    if (this.newdir) {
      this.projectdir = this.appname + '/';
    }

    this.fs.copy(
      this.templatePath('base'),
      this.destinationPath(this.projectdir)
    );

    this.files.forEach(function(entry) {
      var destination = entry;
      destination     = destination.replace('seed.js', filename + '.js');
      destination     = destination.replace('seed.html', filename + '.html');
      destination     = destination.replace('unitTests.js', filename + '.js');
      destination     = destination.replace('e2eTests.js', filename + '.js');
      destination     = destination.replace('<%>', '.');

      this.fs.copyTpl(
        this.templatePath('files/' + entry),
        this.destinationPath(this.projectdir + destination), {
          componentTitle: this.title,
          componentName: this.appname,
          componentCamelName: this.camelname,
          componentCamelDirective: this.camelname,
          directiveFile: filename + '.js',
          templateFile: filename + '.html',
          apiVersion: this.apiVersion,
          bootstrapVersion: this.bootstrapVersion
        }
      );
    }.bind(this));

  },

  install: function() {
    if (this.newdir) {
      try { process.chdir(this.projectdir); }
      catch (error) {
        return this.log('Ooops, there has been an error:', error);
      }
    }

    this.installDependencies({
      bower: false,
      npm: true,
      skipInstall: false,
      callback: function() {
        console.log('\nInstalling the ' + chalk.bold.yellow('webdriver') +
          ' for protractor\n');
        child_process.spawnSync('gulp', ['protractor:update-webdriver']);
        console.log('\nInstalling ' + chalk.bold.yellow('test dependencies') +
          '\n');
        child_process.spawnSync('gulp', ['test-dependencies']);
        console.log('\nGenerating ' + chalk.bold.yellow('scripts.min.js') + '\n');
        child_process.spawnSync('gulp', ['minify']);
      }
    });

  },

  end: function() {
    this.log(chalk.bold.green('\nI\'m all done! Have a great day.'));
  }

});
