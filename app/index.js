var generators = require('yeoman-generator');
var changeCase = require('change-case');
var fs         = require('fs');
var chalk      = require('chalk');

module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments);
    this.argument('compname', { type: String, required: false});
  },

  initializing: function() {
    this.files    = this.fs.readJSON(this.sourceRoot() + '/files.json');
    this.newdir   = false;
    if (this.compname) {
      this.appname = this.compname;
      this.newdir  = true;
    }

    this.appname  = changeCase.paramCase(this.appname);
  },

  writing: function() {
    var basefilename = this.appname.split('-');
    var key          = 0;

    //if this is a native component we need another filename
    if (basefilename[0] === 'tws') {
      key = 1;
    }

    //Let's format the component name to our needs
    this.title          = changeCase.sentenceCase(this.appname).slice(4);
    this.title          = changeCase.upperCaseFirst(this.title);
    this.camelname      = changeCase.camelCase(this.appname);
    this.directive      = this.appname + '-directive';
    this.cameldirective = changeCase.camelCase(this.directive);
    this.directiveFile  = basefilename[key] + '.js';
    this.templateFile   = basefilename[key] + '.html';

    //if we need a new directory, set path
    this.projectdir = '';
    if (this.newdir) {
      this.projectdir = this.appname + '/';
    }

    this.fs.copy(
      this.templatePath('base'),
      this.destinationPath(this.projectdir)
    );

    this.files.forEach(function(entry) {
      var destination = entry;
      destination     = destination.replace('seed.js', this.directiveFile);
      destination     = destination.replace('seed.html', this.templateFile);
      destination     = destination.replace('<%>', '.');

      this.fs.copyTpl(
        this.templatePath('files/' + entry),
        this.destinationPath(this.projectdir + destination), {
          componentTitle: this.title,
          componentCamelName: this.camelname,
          componentDirective: this.directive,
          componentCamelDirective: this.cameldirective,
          directiveFile: this.directiveFile,
          templateFile: this.templateFile
        }
      );
    }.bind(this));

  },

  install: function() {
    if (this.newdir) {
      try { process.chdir(this.projectdir); }
      catch (error) { return this.log('Ooops, there has been an error:', error); }
    }

    this.log('\nI\'m just running ' + chalk.bold.yellow('npm install') +
             ' for you, if this fails try running the command yourself.\n');

    this.npmInstall();
  },

  end: function() {
    this.log(chalk.bold.green('\nI\'m all done! Have a great day.'));
  }

});
