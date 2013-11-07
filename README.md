step-error
==========

Plugin for [Creationix's flow control library (step)](https://github.com/creationix/step) for global error handling.

## About

Use Step as you normally would, except callbacks don't get an `err` Object.  To
handle errors, add event handlers or `_catch()` or `_finally()` functions.

You may add more than one `_catch()` function, but only one `_finally()` function.
In addition, you may provide a `_catchAll()` function, which will be called for each
error, not just for the first one.

This error handling technique was inspired by [node-block](https://github.com/tasogarepg/node-block).

The caveat is that all functions need to expect the first argument to be the Error
Object, or `null` if there is no error.

## Install

Just install step-error.  Step is installed as a dependency.

`npm install step-error`

## API

`StepError(func1, func2, ...)`

where `func1` and `func2` are functions that you would normally pass to `Step(...)`.

If an error occurs in `func1`, for example, `func2` will not be executed (unless
`func2` has any of the special function names described below).

#### Special Function Names

If the name of any function is `_catch`, it will ONLY be called on the first error.
If the name of any function is `_catchAll`, it will ONLY be called on each error.
If the name of any function is `_finally`, it will ONLY be called after everything is
done, even if an error occurs.

#### Event Handlers

`StepError` also returns an `EventEmitter` Object which will emit `error` events.
If no function named `_finally` is passed to `StepError`, then the `EventEmitter`
will also emit a single `done` event.

This method is generally preferred over using special function names.

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
  }
).on("error", function(err) {
  console.dir(err);
});
```

... or instead of using `on("error")`, just pass a function named `_catch` to
`StepError`.
