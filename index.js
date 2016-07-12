import 'babel-polyfill'
import changeCase from 'change-case';
import fs from 'fs';
import chalk from 'chalk';
import child_process from 'child_process';
import http from 'http';
import { Base } from 'yeoman-generator';

const getComponentVersion = (name) => {
  return new Promise((resolve, reject) => {
    http.get(`http://origin.diversity.io/components/${name}/*/files/diversity.json`, res => {
      res.setEncoding('utf8');
      res.on('data', comp => {
        comp = JSON.parse(comp);
        resolve(comp.version);
      });
      if (res.statusCode !== 200) {
        reject(res);
      }
    })
  })
}

class diversityComponentGenerator extends Base {
  constructor(...args) {
    super(...args);
    this.argument('compname', {type: String, required: false});
  }

  initializing() {
    this.appname = changeCase.paramCase(this.appname);
    this.files = this.fs.readJSON(`${this.sourceRoot()}/files.json`);
    this.newdir = false;

    if (this.compname) {
      this.appname = this.compname;
      this.newdir  = true;
    }
  }

  prompting() {
    const done = this.async();

    this.prompt([{
        type: 'checkbox',
        name: 'deps',
        message: 'What dependencies do you want?',
        choices: ['tws-api', 'tws-util', 'tws-schema-form', 'tws-article-service', 'tws-ladda'],
        default: ['tws-api'],
      }], ({ deps }) => {
        Promise.all(deps.map(dep => getComponentVersion(dep))).then((res) => {
          // Object with all diversityDeps
          this.diversityDeps = deps.reduce((object, current, index) => {
            object[current] = `^${res[index]}`;
            return object;
          }, {});
          done();
        });
      }
    );
  }

  writing() {
    let filename = this.appname;
    const split = this.appname.split('-');

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
      this.projectdir = `${this.appname}/`;
    }

    this.fs.copy(
      this.templatePath('base'),
      this.destinationPath(this.projectdir)
    );

    this.files.forEach((entry) => {
      let destination = entry;
      destination     = destination.replace('seed.js', `${filename}.js`);
      destination     = destination.replace('seed.html', `${filename}.html`);
      destination     = destination.replace('unitTests.js', `${filename}.js`);
      destination     = destination.replace('e2eTests.js', `${filename}.js`);
      destination     = destination.replace('<%>', '.');

      this.fs.copyTpl(
        this.templatePath('files/' + entry),
        this.destinationPath(this.projectdir + destination), {
          componentTitle: this.title,
          componentName: this.appname,
          componentCamelName: this.camelname,
          componentCamelDirective: this.camelname,
          directiveFile: filename + '.js',
          filename: filename,
          templateFile: filename + '.html',
          diversityDeps: JSON.stringify(this.diversityDeps)
        }
      );
    });
  }

  install() {
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
      callback: () => {

        // FIXME: Use ES6 template stings for a cleaner look!
        console.log('\nInstalling ' + chalk.bold.yellow('test dependencies') +
          '\n');
        child_process.spawnSync('npm', ['run', 'test-dependencies']);
        console.log('\nGenerating ' + chalk.bold.yellow('scripts.min.js') + '\n');
        child_process.spawnSync('npm', ['run', 'build']);
      }
    });
  }

  done() {
    this.log(chalk.bold.green('\nI\'m all done! Have a great day.'));
  }

}

module.exports = diversityComponentGenerator;
