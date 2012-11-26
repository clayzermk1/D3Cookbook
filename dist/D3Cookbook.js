/*! D3Cookbook - v0.1.0 - 2012-11-21
* https://github.com/clayzermk1/D3Cookbook
* Copyright (c) 2012 ; Licensed  */

// Calculates the min an array of series.
var _min = function(seriesRA, axis) {
  var min = seriesRA[0].data[0][axis],
      smin = null;

  _.each(seriesRA, function(s) {
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

  _.each(seriesRA, function(s) {
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
    this.options = _.defaults(options, this.defaultOptions);
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
    this.options = _.defaults(recipe.options, this.defaultOptions);
    this.svg = recipe.svg.attr("transform", "translate(" + ( (this.options.width / 2) + this.options.margin.left ) + "," + ( (this.options.height / 2) + this.options.margin.top ) + ")");
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
      .enter()
      .append("g")
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
    xAxisFormatter: function(d) { return d; },
    yAxisFormatter: function(d) { return d; },
    xFormatter: function(d) { return +d; },
    yFormatter: function(d) { return +d; }
  },

  x: null,
  y: null,
  xAxis: null,
  yAxis: null,

  init: function(recipe){
    this.options = _.defaults(recipe.options, this.defaultOptions);
    this.svg = recipe.svg.attr("transform", "translate(" + this.options.margin.left + "," + this.options.margin.top + ")");
    this.data = recipe.data;

    // Format data.
    _.each(this.data.series, function(s) {
      _.each(s.data, function(d) {
        d.x = this.options.xFormatter(d.x);
        d.y = this.options.yFormatter(d.y);
      }, this);
    }, this);

    this.createScales();
    this.createAxes();
    this.draw();
    this.drawAxes();

    return this;
  },

  createScales: function() {
    this.x = d3.scale.linear()
      .domain([_min(this.data.series, "x"), _max(this.data.series, "x")])
      .range([0, this.options.width]);

    this.y = d3.scale.linear()
      .domain([_min(this.data.series, "y"), _max(this.data.series, "y")])
      .range([this.options.height, 0]);
  },

  createAxes: function() {
    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom")
      .tickFormat(this.options.xAxisFormatter);
    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left")
      .tickFormat(this.options.yAxisFormatter);
  },

  drawAxes: function() {
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.options.height + ")")
      .call(this.xAxis)
      .append("text")
        .attr("x", this.options.width - 6)
        .attr("y", -6)
        .attr("dx", ".71em")
        .style("text-anchor", "end")
        .text(this.data.axis.labels.x ? this.data.axis.labels.x : "");

    this.svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis)
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
  defaultOptions: {
    xAxisFormatter: d3.time.format("%d-%b-%y").format,
    yAxisFormatter: function(d) { return d; },
    xFormatter: d3.time.format("%d-%b-%y").parse,
    yFormatter: function(d) { return +d; }
  },

  createScales: function() {
    this.x = d3.time.scale()
      .domain([_min(this.data.series, "x"), _max(this.data.series, "x")])
      .range([0, this.options.width]);

    this.y = d3.scale.linear()
      .domain([_min(this.data.series, "y"), _max(this.data.series, "y")])
      .range([this.options.height, 0]);
  },

  draw: function() {
    var x = this.x;
    var y = this.y;
    var g = null;

    _.each(this.data.series, function(s) {
      this.svg
        .append("g")
          .attr("id", s.label)
          .attr("class", "series")
          .append("path")
            .datum(s.data)
            .attr("class", "line")
            .attr("d", d3.svg.line()
              .x(function(d) { return x(d.x); })
              .y(function(d) { return y(d.y); })
            )
            .style("fill", s.style && s.style['fill'] ? s.style['fill'] : 'none')
            .style("stroke", s.style && s.style['stroke'] ? s.style['stroke'] : 'steelblue')
            .style("stroke-width", s.style && s.style['stroke-width'] ? s.style['stroke-wdith'] : '1.5px');
    }, this);
  }
});

Recipe['area'] = Recipe['_cartesian'].extend({
  defaultOptions: {
    xAxisFormatter: d3.time.format("%d-%b-%y").format,
    yAxisFormatter: function(d) { return d; },
    xFormatter: d3.time.format("%d-%b-%y").parse,
    yFormatter: function(d) { return +d; }
  },

  createScales: function() {
    this.x = d3.time.scale()
      .domain([_min(this.data.series, "x"), _max(this.data.series, "x")])
      .range([0, this.options.width]);

    this.y = d3.scale.linear()
      .domain([0, _max(this.data.series, "y")])
      .range([this.options.height, 0]);
  },

  draw: function() {
    var x = this.x;
    var y = this.y;

    this.data.series.forEach(function(s) {
      this.svg
        .append("g")
          .attr("id", s.label)
          .attr("class", "series")
          .append("path")
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

Recipe['bar'] = Recipe['_cartesian'].extend({
  defaultOptions: {
    xAxisFormatter: function(d) { return d; },
    yAxisFormatter: d3.format(".0%"),
    xFormatter: function(d) { return d; },
    yFormatter: function(d) { return +d; }
  },

  createScales: function() {
    this.x = d3.scale.ordinal()
      .domain(
        _.chain(this.data.series)
          .reduce(function(m, d) {
            return m.concat(d.data);
          }, [])
          .pluck("x")
          .uniq()
          .sortBy("value")
          .value()
      )
      .rangeRoundBands([0, this.options.width], 0.1);

    this.y = d3.scale.linear()
      .domain([0, _max(this.data.series, "y")])
      .range([this.options.height, 0]);
  },

  draw: function() {
    var x = this.x;
    var y = this.y;
    var height = this.options.height;

    _.each(this.data.series, function(s) {
      this.svg
        .append("g")
        .attr("id", s.label)
        .attr("class", "series")
        .selectAll(".bar")
        .data(s.data)
        .enter()
        .append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.x); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.y); })
          .attr("height", function(d) { return height - y(d.y); })
          .style("fill", s.style && s.style['fill'] ? s.style['fill'] : 'steelblue');
    }, this);
  }
});

Recipe['geo'] = Recipe.extend({
  defaultOptions: {
    "projection": "mercator",
    "origin": [0, 0],
    "zoom": 1.0
  },

  init: function(recipe){
    this.options = _.defaults(recipe.options, this.defaultOptions);
    this.svg = recipe.svg;
    this.update(recipe.data);
    return this;
  },

  draw: function() {
    var xyproj = d3.geo[this.options.projection](this.options.origin);

    switch (this.options.projection) {
      case "mercator":
        xyproj = xyproj
          //.scale(Math.max(this.options.width / 960, this.options.height / 500) * 100 * this.options.zoom)
          .scale(Math.min(this.options.width, this.options.height) * (Math.min(this.options.width, this.options.height) / 500) * this.options.zoom)
          //.translate([( (-this.options.origin[0] / 180) * this.options.zoom * 500) + (this.options.width / 2), ( (this.options.origin[1] / 180) * this.options.zoom * 500) + (this.options.height / 2)]);
          .translate([this.options.width / 2, (this.options.height / 2) + (0.1 * this.options.height)]);

        this.svg
          .selectAll("path")
            .data(this.data.features)
            .enter()
            .append("path")
              .attr("d", d3.geo.path().projection(xyproj));
        break;
      case "albers":
        var pdiff = 180 * this.options.height / 500 * this.options.zoom / 3;

        xyproj = xyproj
          .parallels([ this.options.origin[1] + pdiff, this.options.origin[1] - pdiff + 0.00001 ]);
          //.scale(Math.min(this.options.width, this.options.height) * 0.25 * this.options.zoom);

        this.svg
          .selectAll("path")
            .data(this.data.features)
            .enter()
            .append("path")
              .attr("d", d3.geo.path().projection(xyproj));
        break;
      case "albersUsa":
        xyproj = xyproj
          //.scale( (Math.min(this.options.width, this.options.height) / 2) * 4 * this.options.zoom)
          //.scale(Math.min(this.options.width, this.options.height) * Math.max( (this.options.width / 960), (this.options.height / 500) ) * 2 * this.options.zoom)
          .scale(Math.min(this.options.width, this.options.height) * (Math.max(this.options.width, this.options.height) / 1000) * this.options.zoom)
          .translate([this.options.width / 2, this.options.height / 2]);

        this.svg
          .selectAll("path")
            .data(this.data.features)
            .enter()
            .append("path")
              .attr("d", d3.geo.path().projection(xyproj));
        break;
      case "orthographic": //TODO broken because d3.geo.circle.clip API is not finalized in 3.0.0pre
        xyproj = xyproj
          .scale( (Math.min(this.options.width, this.options.height) / 2) * this.options.zoom)
          .translate([this.options.width / 2, this.options.height / 2]);

        this.svg
          .selectAll("path")
            //.data(this.data.features.map(d3.geo.circle().origin(this.options.origin)))
            .data(this.data.features) //TODO fix this, causes the back of the world to show through
            .enter()
            .append("path")
              .attr("d", d3.geo.path().projection(xyproj));
        break;
      default:
        this.svg
          .selectAll("path")
            .data(this.data.features)
            .enter()
            .append("path")
              .attr("d", d3.geo.path().projection(xyproj));
        break;
    }
  }
});
