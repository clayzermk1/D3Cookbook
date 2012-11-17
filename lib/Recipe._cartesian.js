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
