/*! D3Cookbook - v0.1.0 - 2012-12-13
* https://github.com/clayzermk1/D3Cookbook
* Copyright (c) 2012 ; Licensed  */

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

  options: null,
  svg: null,

  init: function(options){
    this.options = _.defaults(options, this.defaultOptions);
    this.svg = d3.select(this.options.selector ? this.options.selector : "body").append("svg")
        .attr("width", this.options.width + this.options.margin.left + this.options.margin.right)
        .attr("height", this.options.height + this.options.margin.top + this.options.margin.bottom)
      .append("g");

    this.parseData(this.options.data);

    return this;
  },

  parseData: function(data) {
    this.options.data = _.clone(data, true);
  },

  update: function(data) {
    // Update the data.
    if (!_.isUndefined(data)) {
      this.parseData(data);
    } else {
      this.parseData(this.options.data);
    }

    // Redraw the graph.
    this.drawGraph();
  }
});

Recipe['pie'] = Recipe.extend({
  defaultOptions: {
    margin: {top: 50, right: 50, bottom: 50, left: 50},
    height: 500,
    width: 500,
    r: 250,
    rh: 0,
    labelKey: "label",
    valueKey: "value",
    labelFormatter: function(d) { return d; },
    valueFormatter: function(d) { return d; },
    colors: d3.scale.category10()
  },

  init: function(data, options){
    this._super(data, options);

    this.svg.attr("transform", "translate(" + ( (this.options.width / 2) + this.options.margin.left ) + "," + ( (this.options.height / 2) + this.options.margin.top ) + ")");

    this.drawGraph();

    return this;
  },

  parseData: function(data) {
    this._super(data);

    _.each(this.options.data, function(d) {
        d[this.options.valueKey] = this.options.valueFormatter(d[this.options.valueKey]);
    }, this);
  },

  drawGraph: function() {
    var labelKey = this.options.labelKey;
    var valueKey = this.options.valueKey;
    var colors = this.options.colors;

    var arc = d3.svg.arc()
      .outerRadius(this.options.r)// - Math.max(this.options.margin.top, this.options.margin.right, this.options.margin.bottom, this.options.margin.left))
      .innerRadius(this.options.rh);

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d[valueKey]; });

    var value = this.svg.selectAll(".value")
      .data(pie(this.options.data));

    var g = value
      .enter()
      .append("g")
        .attr("class", "value");

    g.append("path");
    g.append("text");

    value.exit().remove();

    value
      .attr("id", function(d) { return d.data[labelKey]; });

    value.select("path")
      .attr("d", arc)
      .style("fill", function(d) { return colors(d.data[labelKey]); })
      .style("stroke", "#fff")
      .style("stroke-width", '1.5px');

    value.select("text")
      .text(function(d) { return d.data[labelKey]; })
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle");
  }
});

Recipe['_cartesian'] = Recipe.extend({
  defaultOptions: {
    margin: {top: 50, right: 50, bottom: 50, left: 50},
    height: 500,
    width: 500,
    xKey: "x",
    yKey: "y",
    xFormatter: function(d) { return d; },
    yFormatter: function(d) { return d; },
    xScale: d3.scale.linear,
    yScale: d3.scale.linear,
    xAxisLabel: "",
    yAxisLabel: "",
    xAxisFormatter: function(d) { return d; },
    yAxisFormatter: function(d) { return d; },
    seriesKey: "",
    colors: d3.scale.category10()
  },

  nest: null,
  x: null,
  y: null,
  xAxis: null,
  yAxis: null,

  init: function(data, options){
    this._super(data, options);

    this.svg.attr("transform", "translate(" + this.options.margin.left + "," + this.options.margin.top + ")");

    this.createScales();
    this.drawGraph();
    this.createAxes();

    return this;
  },

  parseData: function(data) {
    this._super(data);

    _.each(this.options.data, function(d) {
      try {
        d[this.options.xKey] = this.options.xFormatter(d[this.options.xKey]);
      } catch (e) {
        if (!(e instanceof TypeError)) {
          throw e;
        }
      }
      try {
        d[this.options.yKey] = this.options.yFormatter(d[this.options.yKey]);
      } catch (e) {
        if (!(e instanceof TypeError)) {
          throw e;
        }
      }
    }, this);

    // Nest the data by series.
    var seriesKey = this.options.seriesKey;
    this.nest = d3.nest()
      .key(_.isFunction(seriesKey) ? seriesKey : function(d) { return d[seriesKey]; })
      .entries(this.options.data);
  },

  createScales: function() {
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;

    this.x = this.options.xScale()
      .domain(d3.extent(this.options.data, function(d) { return d[xKey]; }))
      .range([0, this.options.width]);

    this.y = this.options.yScale()
      .domain(d3.extent(this.options.data, function(d) { return d[yKey]; }))
      .range([this.options.height, 0])
      .nice();
  },

  updateScales: function() {
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;

    this.x.domain(d3.extent(this.options.data, function(d) { return d[xKey]; }));
    this.y.domain(d3.extent(this.options.data, function(d) { return d[yKey]; })).nice();
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

    this.drawAxes();
  },

  drawAxes: function() {
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.options.height + ")")
      .call(this.xAxis)
      .append("text")
        .attr("x", this.options.width / 2)
        .attr("y", (this.options.margin.bottom - 10))
        .attr("dx", ".71em")
        .style("text-anchor", "middle")
        .text(this.options.xAxisLabel);

    this.svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -this.options.height / 2)
        .attr("y", -(this.options.margin.left - 10))
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .text(this.options.yAxisLabel);

    d3.selectAll('.axis path, .axis line')
      .style("fill", "none")
      .style("stroke", "black")
      .style("shape-rendering", "crispEdges");

    d3.selectAll('.axis text')
      .style("font-size", "10px");
  },

  update: function(data) {
    // Update the data.
    if (!_.isUndefined(data)) {
      this.parseData(data);
    } else {
      this.parseData(this.options.data);
    }

    // Update the scale domains.
    this.updateScales();

    // Redraw the graph.
    this.drawGraph();

    // Redraw the axes.
    this.svg.selectAll(".axis").remove();
    this.drawAxes();
  }
});

Recipe['line'] = Recipe['_cartesian'].extend({
  drawGraph: function() {
    var x = this.x;
    var y = this.y;
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;
    var seriesKey = this.options.seriesKey;
    var colors = this.options.colors;

    var series = this.svg.selectAll(".series")
      .data(this.nest);

    series
      .enter()
      .append("g")
        .attr("class", "series")
        .append("path");

    series.exit().remove();

    series.attr("id", function(s) { return s.key; });

    series.select("path")
      .datum(function(s) { return s.values;})
      .attr("d", d3.svg.line()
        .x(function(d) { return x(d[xKey]); })
        .y(function(d) { return y(d[yKey]); })
      )
      .style("fill", 'none')
      .style("stroke", function(d) { return colors(d[0][seriesKey]); })
      .style("stroke-width", '1px');
  }
});

Recipe['area'] = Recipe['_cartesian'].extend({
  drawGraph: function() {
    var x = this.x;
    var y = this.y;
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;
    var seriesKey = this.options.seriesKey;
    var colors = this.options.colors;

    var series = this.svg.selectAll(".series")
      .data(this.nest);

    series
      .enter()
      .append("g")
        .attr("class", "series")
        .append("path");

    series.exit().remove();

    series.attr("id", function(s) { return s.key; });

    series.select("path")
      .datum(function(s) { return s.values;})
      .attr("d", d3.svg.area()
        .x(function(d) { return x(d[xKey]); })
        .y0(this.options.height)
        .y1(function(d) { return y(d[yKey]); })
      )
      .style("fill", function(d) { return colors(d[0][seriesKey]); })
      .style("fill-opacity", 0.5)
      .style("stroke", function(d) { return colors(d[0][seriesKey]); })
      .style("stroke-width", '1px');
  }
});

Recipe['bar'] = Recipe.extend({
  defaultOptions: {
    margin: {top: 50, right: 50, bottom: 50, left: 50},
    height: 500,
    width: 500,
    lData: null,
    xKey: "x",
    yKey: "y",
    lKey: "",
    xFormatter: function(d) { return d; },
    yFormatter: function(d) { return d; },
    lFormatter: function(d) { return d; },
    xScale: d3.scale.ordinal,
    yScale: d3.scale.linear,
    lScale: d3.scale.linear,
    xAxisLabel: "",
    yAxisLabel: "",
    lAxisLabel: "",
    xAxisFormatter: function(d) { return d; },
    yAxisFormatter: function(d) { return d; },
    lAxisFormatter: function(d) { return d; },
    seriesKey: "",
    colors: d3.scale.category10(),
    lColor: "#000"
  },

  nest: null,
  lData: null,
  x: null,
  x1: null,
  y: null,
  l: null,
  xAxis: null,
  yAxis: null,
  lAxis: null,

  init: function(data, options){
    this._super(data, options);

    this.parseLineData(this.options.lData);

    this.svg.attr("transform", "translate(" + this.options.margin.left + "," + this.options.margin.top + ")");

    this.createScales();
    this.drawGraph();
    this.createAxes();

    return this;
  },

  parseData: function(data) {
    this._super(data);

    _.each(this.data, function(d) {
        d[this.options.xKey] = this.options.xFormatter(d[this.options.xKey]);
        d[this.options.yKey] = this.options.yFormatter(d[this.options.yKey]);
    }, this);

    // Nest the data by x and then series.
    var xKey = this.options.xKey;
    var seriesKey = this.options.seriesKey;
    this.nest = d3.nest()
      .key(function(d) { return d[xKey]; })
      .key(function(d) { return d[seriesKey]; })
      .entries(this.data);
  },

  parseLineData: function(lData) {
    this.lData = _.clone(lData, true);

    _.each(this.lData, function(d) {
        d[this.options.lKey] = this.options.lFormatter(d[this.options.lKey]);
    }, this);
  },

  createScales: function() {
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;
    var lKey = this.options.lKey;
    var seriesKey = this.options.seriesKey;

    this.x = this.options.xScale()
      .domain(_.chain(this.data).pluck(xKey).uniq().value())
      .rangeRoundBands([0, this.options.width], 0.1);

    this.x1 = this.options.xScale()
      .domain(_.chain(this.data).pluck(seriesKey).uniq().value())
      .rangeRoundBands([0, this.x.rangeBand()]);

    this.y = this.options.yScale()
      .domain([0, d3.max(this.data, function(d) { return d[yKey]; })])
      .range([this.options.height, 0])
      .nice();

    if (!_.isEmpty(lKey)) {
      this.l = this.options.lScale()
        .domain(d3.extent(this.lData, function(d) { return d[lKey]; }))
        .range([this.options.height, 0])
        .nice();
    }
  },

  updateScales: function() {
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;
    var lKey = this.options.lKey;
    var seriesKey = this.options.seriesKey;

    this.x.domain(_.chain(this.data).pluck(xKey).uniq().value());
    this.x1.domain(_.chain(this.data).pluck(seriesKey).uniq().value());
    this.y.domain([0, d3.max(this.data, function(d) { return d[yKey]; })]).nice();

    if (!_.isEmpty(lKey)) {
      this.l.domain(d3.extent(this.lData, function(d) { return d[lKey]; })).nice();
    }
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

    if (!_.isEmpty(this.options.lKey)) {
      this.lAxis = d3.svg.axis()
        .scale(this.l)
        .orient("right")
        .tickFormat(this.options.lAxisFormatter);
    }

    this.drawAxes();
  },

  drawAxes: function() {
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.options.height + ")")
      .call(this.xAxis)
      .append("text")
        .attr("x", this.options.width / 2)
        .attr("y", (this.options.margin.bottom - 10))
        .attr("dx", ".71em")
        .style("text-anchor", "middle")
        .text(this.options.xAxisLabel);

    this.svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -this.options.height / 2)
        .attr("y", -(this.options.margin.left - 10))
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .text(this.options.yAxisLabel);

    if (!_.isEmpty(this.options.lKey)) {
      this.svg.append("g")
        .attr("class", "l axis")
        .attr("transform", "translate(" + this.options.width + ", 0)")
        .call(this.lAxis)
        .append("text")
          .attr("transform", "rotate(90)")
          .attr("x", this.options.height / 2)
          .attr("y", -(this.options.margin.right - 10))
          .attr("dy", ".71em")
          .style("text-anchor", "middle")
          .text(this.options.lAxisLabel);
    }

    d3.selectAll('.axis path, .axis line')
      .style("fill", "none")
      .style("stroke", "black")
      .style("shape-rendering", "crispEdges");

    d3.selectAll('.axis text')
      .style("font-size", "10px");
  },

  drawGraph: function() {
    var x = this.x;
    var x1 = this.x1;
    var y = this.y;
    var l = this.l;
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;
    var lKey = this.options.lKey;
    var seriesKey = this.options.seriesKey;
    var colors = this.options.colors;
    var height = this.options.height;
    var yAxisFormatter = this.options.yAxisFormatter;

    var groups = this.svg.selectAll(".group")
      .data(this.nest);

    groups
      .enter()
      .append("g")
        .attr("id", function(g) { return g.key; })
        .attr("class", "group");

    groups.exit().remove();

    var bars = groups.selectAll(".bar")
      .data(function(g) { return g.values; });

    var g = bars
      .enter()
      .append("g")
        .attr("class", "bar");

    g.append("rect");
    g.append("text");

    bars.exit().remove();

    bars
      .attr("id", function(s) { return s.key; })
      .attr("transform", function(d) { return "translate(" + x(d.values[0][xKey]) + ", 0)"; });

    bars.selectAll("rect")
      .datum(function() { return this.parentNode.__data__.values[0]; })
      .attr("x", function(d) { return x1(d[seriesKey]); })
      .attr("y", function(d) { return y(d[yKey]); })
      .attr("width", x1.rangeBand())
      .attr("height", function(d) { return height - y(d[yKey]); })
      .style("fill", function(d) { return colors(d[seriesKey]); })
      .style("fill-opacity", 0.5)
      .style("stroke", function(d) { return colors(d[seriesKey]); })
      .style("stroke-width", '1px');

    bars.selectAll("text")
      .datum(function() { return this.parentNode.__data__.values[0]; })
      .text(function(d) { return yAxisFormatter(d[yKey]); })
      .attr("transform", "rotate(-90)")
      .attr("x", function(d) { return -height + (height - y(d[yKey])) + 6; })
      .attr("y", function(d) { return x1(d[seriesKey]) + (0.7 * x1.rangeBand()); })
      .attr("text-anchor", "start")
      .style("fill", "#000")
      .style("font-size", "10px");

    if (!_.isEmpty(lKey)) {
      this.svg.append("g")
          .attr("class", "line")
          .attr("transform", "translate(" + (x.rangeBand() / 2) + ", 0)")
          .append("path")
            .datum(this.lData)
            .attr("d", d3.svg.line()
              .x(function(d) { return x(d[xKey]); })
              .y(function(d) { return l(d[lKey]); })
            )
            .style("fill", 'none')
            .style("stroke", this.options.lColor)
            .style("stroke-width", '1px');
    }
  },

  update: function(data) {
    // Update the data.
    this.parseData(data);

    // Update the scale domains.
    this.updateScales();

    // Redraw the graph.
    this.drawGraph();

    // Redraw the axes.
    this.svg.selectAll(".axis").remove();
    this.drawAxes();
  },

  updateLine: function(lData) {
    // Update the line data.
    this.parseLineData(lData);

    // Update the scale domains.
    this.updateScales();

    // Redraw the graph.
    this.drawGraph();

    // Redraw the axes.
    this.svg.selectAll(".axis").remove();
    this.drawAxes();
  }
});

Recipe['scatter'] = Recipe['_cartesian'].extend({
  defaultOptions: {
    margin: {top: 50, right: 50, bottom: 50, left: 50},
    height: 500,
    width: 500,
    xKey: "x",
    yKey: "y",
    rKey: "",
    xFormatter: function(d) { return d; },
    yFormatter: function(d) { return d; },
    rFormatter: function(d) { return d; },
    xScale: d3.scale.linear,
    yScale: d3.scale.linear,
    xAxisLabel: "",
    yAxisLabel: "",
    rAxisLabel: "",
    xAxisFormatter: function(d) { return d; },
    yAxisFormatter: function(d) { return d; },
    rAxisFormatter: function(d) { return d; },
    seriesKey: "",
    colors: d3.scale.category10()
  },

  drawAxes: function() {
    if (!_.isEmpty(this.options.rKey)) {
      this.svg.append("g")
        .attr("class", "r axis")
        .attr("transform", "translate(0, 0)")
        .append("text")
          .attr("x", this.options.width / 2)
          .attr("y", -10)
          .attr("dx", ".71em")
          .style("text-anchor", "middle")
          .text(this.options.rAxisLabel);
    }

    this._super();
  },

  drawGraph: function() {
    var x = this.x;
    var y = this.y;
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;
    var rKey = this.options.rKey;
    var rFormatter = this.options.rFormatter;
    var seriesKey = this.options.seriesKey;
    var colors = this.options.colors;

    var series = this.svg.selectAll(".series")
      .data(this.nest);

    series
      .enter()
      .append("g")
        .attr("class", "series");

    series.exit().remove();

    series.attr("id", function(s) { return s.key; });

    var dot = series.selectAll(".dot")
      .data(function(s) { return s.values; });

    dot
      .enter()
      .append("circle")
        .attr("class", "dot");

    dot.exit().remove();

    dot
      .attr("r", function(d) { return rFormatter(d[rKey] ? d[rKey] : 1); })
      .attr("cx", function(d) { return x(d[xKey]); })
      .attr("cy", function(d) { return y(d[yKey]); })
      .style("fill", function(d) { return colors(d[seriesKey]); })
      .style("fill-opacity", 0.5)
      .style("stroke", function(d) { return colors(d[seriesKey]); })
      .style("stroke-width", '1.5px');
  }
});

Recipe['spider'] = Recipe.extend({ //TODO incomplete! need to merge in changes from cartesian and build out in general.
  defaultOptions: {
    r: 250,
    rh: 50,
    interpolation: "cardinal-closed",
    xAxisFormatter: function(d) { return d; },
    yAxisFormatter: d3.format(".0%"),
    xFormatter: function(d) { return d; },
    yFormatter: function(d) { return +d; }
  },

  x: null,
  y: null,
  xAxis: null,
  yAxis: null,

  init: function(recipe){
    this.options = _.defaults(recipe.options, this.defaultOptions);
    this.svg = recipe.svg.attr("transform", "translate(" + ( (this.options.width / 2) + this.options.margin.left ) + "," + ( (this.options.height / 2) + this.options.margin.top ) + ")");
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
    this.x = d3.time.scale()
      .domain([
        0,
        _.chain(this.data.series)
          .reduce(function(m, d) {
            return m.concat(d.data);
          }, [])
          .pluck("x")
          .uniq()
          .sortBy("value")
          .value().length
      ])
      .range([0, 2 * Math.PI]);

    this.y = d3.scale.linear()
      .domain([0, d3.max(this.data, function(d) { return d; })]) //TODO check this
      .range([this.options.r, this.options.rh]);
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
    var x = this.x;
    var y = this.y;
    var r = this.options.r;
    var rh = this.options.rh;
    var xAxisFormatter = this.options.xAxisFormatter;

    this.svg.selectAll(".axis")
      .data(d3.range(x.domain()[1]))
      .enter()
      .append("g")
        .attr("class", "axis")
        .attr("transform", function(d) { return "rotate(" + x(d) * 180 / Math.PI + ")"; })
        .call(d3.svg.axis()
          .scale(y.copy().range([-rh, -r]))
          .orient("left"))
        .append("text")
          .attr("y", -r - 12)
          .attr("dy", ".71em")
          .attr("text-anchor", "middle")
          .text(function(d) { return xAxisFormatter(d); });
  },

  draw: function() {
    var x = this.x;
    var y = this.y;
    var area = d3.svg.area.radial()
      .interpolate(this.options.interpolation)
      .angle(function(d) {
        return x(d.x); })
      .innerRadius(function(d) {
        return y(0); })
      .outerRadius(function(d) {
        return y(d.y); });

    this.svg.selectAll(".series")
      .data(this.data.series)
      .enter()
      .append("path")
        .attr("class", "layer")
        .attr("d", function(s) {
          return area(s.data); })
        .style("fill", function(s) { return s.style && s.style['fill'] ? s.style['fill'] : 'steelblue'; });
  }
});

Recipe['geo'] = Recipe.extend({ //TODO incomplete! need to wait until d3.v3 api is finalized.
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

Recipe['heatmap'] = Recipe.extend({
  defaultOptions: {
    margin: {top: 50, right: 50, bottom: 50, left: 50},
    height: 500,
    width: 500,
    timestampKey: "timestamp",
    valueKey: "value",
    xKey: "hr",
    yKey: "dow",
    timestampFormatter: d3.time.format("%m/%d/%Y %X").parse,
    valueFormatter: function(d) { return d; },
    xFormatter: d3.time.format("%I%p"), // example: 01AM
    yFormatter: d3.time.format("%a"), // example: Mon
    xScale: d3.scale.ordinal,
    yScale: d3.scale.ordinal,
    xDomain: ["12AM", "01AM", "02AM", "03AM", "04AM", "05AM", "06AM", "07AM", "08AM", "09AM", "10AM", "11AM", "12PM", "01PM", "02PM", "03PM", "04PM", "05PM", "06PM", "07PM", "08PM", "09PM", "10PM", "11PM"],
    yDomain: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    xAxisLabel: "Hour of Day",
    yAxisLabel: "Day of Week",
    valueAxisLabel: "green indicates low activity, yellow indicates moderate activity, red indicates high activity",
    xAxisFormatter: function(d) { return d; },
    yAxisFormatter: function(d) { return d; },
    colors: d3.scale.quantize().domain([0, 100]).range(["#00CC00", "#28CC00", "#51CC00", "#7ACC00", "#A3CC00", "#CCCC00", "#CCA300", "#CC7A00", "#CC5100", "#CC2800", "#CC0000"])
  },

  nest: null,
  x: null,
  y: null,
  xAxis: null,
  yAxis: null,

  init: function(data, options){
    this._super(data, options);

    this.svg.attr("transform", "translate(" + this.options.margin.left + "," + this.options.margin.top + ")");

    this.createScales();
    this.drawGraph();
    this.createAxes();

    return this;
  },

  parseData: function(data) {
    this._super(data);

    _.each(this.data, function(d) {
        d[this.options.timestampKey] = this.options.timestampFormatter(d[this.options.timestampKey]);
        d[this.options.xKey] = this.options.xFormatter(d[this.options.timestampKey]);
        d[this.options.yKey] = this.options.yFormatter(d[this.options.timestampKey]);
    }, this);

    // Nest the data by y then x.
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;
    this.nest = d3.nest()
      .key(function(d) { return d[yKey] + d[xKey]; })
      .entries(this.data);

    console.log(this.nest);
  },

  createScales: function() {
    this.x = this.options.xScale()
      .domain(this.options.xDomain)
      .rangeRoundBands([0, this.options.width], 0.1);

    this.y = this.options.yScale()
      .domain(this.options.yDomain)
      .rangeRoundBands([this.options.height, 0], 0.1);
  },

  createAxes: function() {
    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("top")
//      .tickValues(this.options.xDomain)
      .tickFormat(this.options.xAxisFormatter);

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left")
//      .tickValues(this.options.yDomain.reverse())
      .tickFormat(this.options.yAxisFormatter);

    this.drawAxes();
  },

  drawAxes: function() {
    this.svg.append("g")
      .attr("class", "x axis")
      .call(this.xAxis)
      .append("text")
        .attr("x", this.options.width / 2)
        .attr("y", -(this.options.margin.top - 20))
        .attr("dx", ".71em")
        .style("text-anchor", "middle")
        .text(this.options.xAxisLabel);

    this.svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -this.options.height / 2)
        .attr("y", -(this.options.margin.left - 10))
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .text(this.options.yAxisLabel);

    if (!_.isEmpty(this.options.valueKey)) {
      this.svg.append("g")
        .attr("class", "value axis")
        .attr("transform", "translate(0," + (this.options.height + this.options.margin.bottom - 10) + ")")
        .append("text")
          .text(this.options.valueAxisLabel)
          .attr("x", this.options.width / 2)
          .attr("y", -10)
          .attr("dx", ".71em")
          .style("text-anchor", "middle");
    }

    d3.selectAll('.axis path, .axis line')
      .style("fill", "none")
      .style("stroke", "black")
      .style("shape-rendering", "crispEdges");

    d3.selectAll('.axis text')
      .style("font-size", "10px");
  },

  drawGraph: function() {
    var x = this.x;
    var y = this.y;
    var valueKey = this.options.valueKey;
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;
    var valueFormatter = this.options.valueFormatter;
    var colors = this.options.colors;

    var tiles = this.svg.selectAll(".tile")
      .data(this.nest);

    var g = tiles
      .enter()
      .append("g")
        .attr("class", "tile");

    g.append("rect");
    g.append("text");

    tiles.exit().remove();

    tiles.attr("id", function(d) { return d.key; });

    tiles.selectAll("rect")
      .attr("x", function(d) { return x(d.values[0][xKey]); })
      .attr("y", function(d) { return y(d.values[0][yKey]); })
      .attr("width", x.rangeBand())
      .attr("height", y.rangeBand())
      .style("fill", function(d) { return colors(d3.mean(d.values, function(d) { return d[valueKey]; })); })
      .style("fill-opacity", 0.5)
      .style("stroke", function(d) { return colors(d3.mean(d.values, function(d) { return d[valueKey]; })); })
      .style("stroke-width", '1px');

    tiles.selectAll("text")
      .text(function(d) { return valueFormatter( d3.mean(d.values, function(d) { return d[valueKey]; }) ); })
      .attr("x", function(d) { return x(d.values[0][xKey]) + (x.rangeBand() / 2); })
      .attr("y", function(d) { return y(d.values[0][yKey]) + (y.rangeBand() / 2) + 3; })
      .attr("text-anchor", "middle")
      .style("fill", "#000")
      .style("font-size", "10px");
  },

  update: function(data) {
    // Update the data.
    this.parseData(data);

    // Redraw the graph.
    this.drawGraph();

    // Redraw the axes.
    this.svg.selectAll(".axis").remove();
    this.drawAxes();
  }
});
