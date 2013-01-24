step-error
==========

Just like [Creationix's flow control library (step)](https://github.com/creationix/step), except with global error handling.

## About

Use Step as you normally would, except callbacks don't get an `err` Object.  To handle
errors, add optional `catch()` or `finally()` functions.

You may add more than one `catch()` function, but only one `finally()` function.

This error handling technique was inspired by [node-block](https://github.com/tasogarepg/node-block).

## Install

Just install step-error.  Step is installed as a dependency.

`npm install step-error`

## Example

Instead of...

```js
var Step = require("step");
Step(
  function readDir() {
    fs.readdir(__dirname, this);
  },
  function readFiles(err, results) {
    if (err) throw err;
    // Create a new group
    var group = this.group();
    results.forEach(function (filename) {
      if (/\.js$/.test(filename)) {
        fs.readFile(__dirname + "/" + filename, 'utf8', group());
      }
    });
  },
  function showAll(err , files) {
    if (err) throw err;
    console.dir(files);
  }
);
```

write this...

```js
var StepError = require("step-error");
StepError(
  function readDir() {
    fs.readdir(__dirname, this);
  },
  function readFiles(results) {
    // Create a new group
    var group = this.group();
    results.forEach(function (filename) {
      if (/\.js$/.test(filename)) {
        fs.readFile(__dirname + "/" + filename, 'utf8', group());
      }
    });
  },
  function showAll(files) {
    console.dir(files);
  },
  function catch(err) {
    console.dir(err);
  }
);
```
