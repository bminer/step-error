step-error
==========

Just like [Creationix's flow control library (step)](https://github.com/creationix/step), except with global error handling.

## About

Use Step as you normally would, except callbacks don't get an `err` Object.  To handle
errors, add optional `_catch()` or `_finally()` functions.

You may add more than one `_catch()` function, but only one `_finally()` function.
In addition, you may provide a `_catchAll()` function, which will be called for each error,
not just for the first one.

This error handling technique was inspired by [node-block](https://github.com/tasogarepg/node-block).

The caveat is that all functions need to expect the first argument to be the Error Object, or `null` if there
is no error.

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
    this(); //Should be a `this()` call in the final function, as well
  },
  function _catch(err) {
    console.dir(err);
  }
);
```
