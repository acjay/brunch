(function(/*! Brunch !*/) {
  'use strict';

  // NB: due to conflicts with huffpost-web, we namespace brunch require
  // to `window.Conversations`.  If not, all kinds of bugs appear in apps
  // that use requireJS (since this is not a full version of require)
  if ( !window.Conversations ) {
    window.Conversations = {};

    // lodash expects its environment to have the following builtins, so 
    // pull them in from window
    var builtins = [
      'Array', 'Boolean', 'Date', 'Error', 'Function', 'Math', 'Number', 'Object',
      'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
      'parseInt', 'setImmediate', 'setTimeout'];

    for ( var i = 0; i < builtins.length; i++ ) {
      window.Conversations[builtins[i]] = window[builtins[i]];
    }
  }
  var globals = window.Conversations;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    // Our brunch definitions expect the first argument to be the
    // global scope (usually `window`, but for Conversations, it is
    // `window.Conversations`:
    definition(globals, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.brunch = true;
})();

