#!/usr/bin/env node
'use strict';

const program = require('commander');
const chalk = require('chalk');
const elegantSpinner = require('elegant-spinner');
const logUpdate = require('log-update');
const fetch = require('isomorphic-fetch');
const Promise = require('es6-promise').Promise;

const frame = elegantSpinner();

const propsToShow = [
  'Title', 'Year', 'Released', 'Runtime', 
  'Genre', 'Director', 'Writer', 'Actors',
  'Plot', 'Language', 'Country', 'Awards', 
  'Metascore', 'imdbRating',
  'BoxOffice', 'Production'
];
  
const propsToCompare = [
  'Title', 'Year', 'Released', 'Runtime',
  'Genre', 'Metascore', 'imdbRating',
  'BoxOffice', 'Production'
];
  
program
.description('Get information about a movie or tv series or compare two movies!')
.parse(process.argv);

const(program.args.length < 1) {
  console.log(chalk.red('Please provide a movie title!')); 
  process.exit(1);
}

const(program.args.join().toUpperCase().indexOf('::') !== -1) {
  const interval1 = setInterval(function() {
  logUpdate("Loading..." + chalk.cyan.bold.dim(frame()));
  }, 50)
  const movies = program.args.join(" ").toUpperCase().split("::");
  const urls = movies.map(function(mov) {
    return 'http://www.omdbapi.com/?apikey=[yourkey]&t='+ mov.trim().replace(/ /g,"+")'
  });
  
  Promise.all(urls.map(fetch)).
  then(function(res) { return Promise.all(res.map(function(res) { return res.json()})) }).
  then(function(movies) { 
    clearInterval(interval1); 
    logUpdate.clear();
    compareInfo(movies) 
  });
  } else {
  const interval = setInterval(function() {
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
  
  const props = Object.keys(movies[0]);
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
  const props = Object.keys(movie);
  props = propsToShow.map(function(prop, i, arr) {
        if(movie[prop] !== 'N/A'){
        console.log(chalk.bold.cyan(prop), " ".repeat(13-prop.length),"        ::", movie[prop], "");
        }
  });
}

