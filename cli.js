
#!/usr/bin/env node
'use strict';

var program = require('commander');
var chalk = require('chalk');
var elegantSpinner = require('elegant-spinner');
var logUpdate = require('log-update');
var fetch = require('isomorphic-fetch');
var Promise = require('es6-promise').Promise;

var frame = elegantSpinner();

var propsToShow = [
  'Title', 'Year', 'Released', 'Runtime', 
  'Genre', 'Director', 'Writer', 'Actors',
  'Plot', 'Language', 'Country', 'Awards', 
  'Metascore', 'imdbRating', 'tomatoMeter', 
  'BoxOffice', 'Production'
];
  
var propsToCompare = [
  'Title', 'Year', 'Released', 'Runtime',
  'Genre', 'Metascore', 'imdbRating', 'tomatoMeter',
  'BoxOffice', 'Production'
];
  
program
.description('Get information about a movie or tv series or compare two movies!')
.parse(process.argv);

if(program.args.length < 1) {
  console.log(chalk.red('Please give a movie name!!')); 
  process.exit(1);
}

if(program.args.join().toUpperCase().indexOf('::') !== -1) {
  var interval1 = setInterval(function() {
  logUpdate("Loading..." + chalk.cyan.bold.dim(frame()));
  }, 50)
  var movies = program.args.join(" ").toUpperCase().split("::");
  var urls = movies.map(function(mov) {
    return 'http://www.omdbapi.com/?apikey=[yourkey]&t='+ mov.trim().replace(/ /g,"+")
  });
  
  Promise.all(urls.map(fetch)).
  then(function(res) { return Promise.all(res.map(function(res) { return res.json()})) }).
  then(function(movies) { 
    clearInterval(interval1); 
    logUpdate.clear();
    compareInfo(movies) 
  });
  }
else {
  var interval = setInterval(function() {
  logUpdate("Loading..." + chalk.cyan.bold.dim(frame()));
  }, 50)
  fetch('http://www.omdbapi.com/?apikey=[yourkey]&t='+ program.args.join().trim().replace(/ /g,"+")')
  .then(function(res) { return res.json()})
  .then(function(mov) {
    clearInterval(interval); 
    logUpdate.clear();
    printInfo(mov)});
}

function compareInfo(movies) {
  if(movies[0].Response === 'False' || movies[1].Response === 'False') {
    console.log(chalk.red('Movie not found!'));
    process.exit(1);
  }
  
  var props = Object.keys(movies[0]);
  props = propsToCompare.map(function(prop, i, arr) {
        if(movies[0][prop] === 'N/A' && movies[1][prop] === 'N/A') {
          return ;
        }
        console.log(chalk.bold.cyan(prop), " ".repeat(13-prop.length), movies[0][prop], "", 
        " ".repeat(50-movies[0][prop].length), movies[1][prop], ""
        );
  });
  
}

function printInfo(movie) {
  if(movie.Response === 'False') {
    console.log(chalk.red(movie.Error));
    process.exit(1);
  }
  var props = Object.keys(movie);
  props = propsToShow.map(function(prop, i, arr) {
        if(movie[prop] !== 'N/A'){
        console.log(chalk.bold.cyan(prop), " ".repeat(13-prop.length),"        ::", movie[prop], "");
        }
  });
}

