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
