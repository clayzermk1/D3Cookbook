// Underscore.js variables
var nativeForEach = Array.prototype.forEach,
    slice = Array.prototype.slice,
    breaker = {};

// Underscore.js' defaults funciton, http://underscorejs.org/#has
// Shortcut function for checking if an object has a given property directly
// on itself (in other words, not on a prototype).
var _has = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

// Underscore.js' defaults funciton, http://underscorejs.org/#each
// The cornerstone, an `each` implementation, aka `forEach`.
// Handles objects with the built-in `forEach`, arrays, and raw objects.
// Delegates to **ECMAScript 5**'s native `forEach` if available.
var _each = function(obj, iterator, context) {
  if (obj == null) { return; }
  if (nativeForEach && obj.forEach === nativeForEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (iterator.call(context, obj[i], i, obj) === breaker) { return; }
    }
  } else {
    for (var key in obj) {
      if (_has(obj, key)) {
        if (iterator.call(context, obj[key], key, obj) === breaker) { return; }
      }
    }
  }
};

// Underscore.js' defaults funciton, http://underscorejs.org/#defaults
// Fill in a given object with default properties.
var _defaults = function(obj) {
  _each(slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      if (obj[prop] == null) { obj[prop] = source[prop]; }
    }
  });
  return obj;
};

// Underscore.js' extend funciton, http://underscorejs.org/#extend
// Extend a given object with all the properties in passed-in object(s).
var _extend = function(obj) {
  _each(slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      obj[prop] = source[prop];
    }
  });
  return obj;
};

// Calculates the min an array of series.
var _min = function(seriesRA, axis) {
  var min = seriesRA[0].data[0][axis],
      smin = null;

  seriesRA.forEach(function(s) {
    smin = d3.min(s.data, function(d) { return d[axis]; });
    if (smin < min) {
      min = smin;
    }
  });

  return min;
};

// Calculates the max of an array of series.
var _max = function(seriesRA, axis) {
  var max = seriesRA[0].data[0][axis],
      smax = null;

  seriesRA.forEach(function(s) {
    smax = d3.max(s.data, function(d) { return d[axis]; });
    if (smax > max) {
      max = smax;
    }
  });

  return max;
};
