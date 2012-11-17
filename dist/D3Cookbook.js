/*! D3Cookbook - v0.1.0 - 2012-11-16
* https://github.com/clayzermk1/D3Cookbook
* Copyright (c) 2012 ; Licensed  */

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

// Simple JavaScript Inheritance, John Resig http://ejohn.org/
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init ) {
        this.init.apply(this, arguments);
      }
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();


var Recipe = Class.extend({
  defaultOptions: {
    margin: {top: 50, right: 50, bottom: 50, left: 50},
    height: 500,
    width: 500
  },

  data: null,
  options: null,
  svg: null,

  init: function(data, options){
    this.options = _defaults(options, this.defaultOptions);
    this.svg = d3.select(this.options.selector ? this.options.selector : "body").append("svg")
        .attr("width", this.options.width + this.options.margin.left + this.options.margin.right)
        .attr("height", this.options.height + this.options.margin.top + this.options.margin.bottom)
      .append("g");

    this.update(data);

    if (options.recipe) {
      return this.cook(this.options.recipe);
    } else {
      return this;
    }
  },

  cook: function(recipeName) {
    return new Recipe[recipeName](this);
  },

  update: function(data) {
    this.data = data;
    this.draw();
    return this;
  },

  draw: function() {}
});

Recipe['pie'] = Recipe.extend({
  defaultOptions: {
    r: 250,
    rh: 0,
    pathStroke: "#fff",
    valueFormatter: function(v) { return +v; }
  },

  init: function(recipe){
    this.options = _defaults(recipe.options, this.defaultOptions);
    this.svg = recipe.svg.attr("transform", "translate(" + this.options.width / 2 + "," + this.options.height / 2 + ")");
    this.update(recipe.data);
    return this;
  },

  draw: function() {
    var arc = d3.svg.arc()
      .outerRadius(this.options.r - Math.max(this.options.margin.top, this.options.margin.right, this.options.margin.bottom, this.options.margin.left))
      .innerRadius(this.options.rh);

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.value; });

    this.data.forEach(function(d) {
      d.value = this.options.valueFormatter(d.value);
    }, this);

    var g = this.svg.selectAll(".arc")
        .data(pie(this.data))
      .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return d.data.color; })
        .style("stroke", this.options.pathStroke);

    g.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.label; });
  }
});

Recipe['donut'] = Recipe['pie'].extend({
  defaultOptions: {
    r: 250,
    rh: 150,
    pathStroke: "#fff",
    valueFormatter: function(v) { return +v; }
  }
});

Recipe['_cartesian'] = Recipe.extend({
  defaultOptions: {
    xFormatter: d3.time.format("%d-%b-%y").parse,
    yFormatter: function(y) { return +y; },
    xMin: _min,
    xMax: _max,
    yMin: function() { return 0; }, //you might also want to use _min() from utility.js
    yMax: _max
  },

  x: null,
  y: null,

  init: function(recipe){
    this.options = _defaults(recipe.options, this.defaultOptions);
    this.svg = recipe.svg.attr("transform", "translate(" + this.options.margin.left + "," + this.options.margin.top + ")");
    this.data = recipe.data;

    this.data.series.forEach(function(s) {
      s.data.forEach(function(d) {
        d.x = this.options.xFormatter(d.x);
        d.y = this.options.yFormatter(d.y);
      }, this);
    }, this);

    this.x = d3.time.scale()
      .domain([this.options.xMin(this.data.series, "x"), this.options.xMax(this.data.series, "x")])
      .range([0, this.options.width]);
    this.y = d3.scale.linear()
      .domain([this.options.yMin(this.data.series, "y"), this.options.yMax(this.data.series, "y")])
      .range([this.options.height, 0]);

    this.draw();
    this.drawAxes();

    return this;
  },

  drawAxes: function() {
    var xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom");
    var yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");

    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.options.height + ")")
      .call(xAxis)
    .append("text")
      .attr("x", this.options.width - 6)
      .attr("y", -6)
      .attr("dx", ".71em")
      .style("text-anchor", "end")
      .text(this.data.axis.labels.x ? this.data.axis.labels.x : "");

    this.svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(this.data.axis.labels.y ? this.data.axis.labels.y : "");

    d3.selectAll('.axis path, .axis line')
      .style("fill", this.data.axis.style && this.data.axis.style['fill'] ? this.data.axis.style['fill'] : "none")
      .style("stroke", this.data.axis.style && this.data.axis.style['stroke'] ? this.data.axis.style['stroke'] : "#000")
      .style("shape-rendering", this.data.axis.style && this.data.axis.style['shape-rendering'] ? this.data.axis.style['shape-rendering'] : "crispEdges");
  }
});

Recipe['line'] = Recipe['_cartesian'].extend({
  draw: function() {
    var x = this.x;
    var y = this.y;

    this.data.series.forEach(function(s) {
      this.svg.append("path")
        .datum(s.data)
        .attr("class", "line")
        .style("fill", s.style && s.style['fill'] ? s.style['fill'] : 'none')
        .style("stroke", s.style && s.style['stroke'] ? s.style['stroke'] : 'steelblue')
        .style("stroke-width", s.style && s.style['stroke-width'] ? s.style['stroke-wdith'] : '1.5px')
//        .style("fill", "none")
//        .style("stroke", 'steelblue')
//        .style("stroke-width", '1.5px')
        .attr("d", d3.svg.line()
          .x(function(d) { return x(d.x); })
          .y(function(d) { return y(d.y); })
        );
    }, this);
  }
});

Recipe['area'] = Recipe['_cartesian'].extend({
  draw: function() {
    var x = this.x;
    var y = this.y;

    this.data.series.forEach(function(s) {
      this.svg.append("path")
        .datum(s.data)
        .attr("class", "area")
        .style("fill", s.style && s.style['fill'] ? s.style['fill'] : 'steelblue')
        .attr("d", d3.svg.area()
          .x(function(d) { return x(d.x); })
          .y0(this.options.height)
          .y1(function(d) { return y(d.y); })
        );
    }, this);
  }
});
