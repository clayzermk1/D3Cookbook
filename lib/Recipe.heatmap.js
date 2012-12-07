Recipe['heatmap'] = Recipe.extend({
  defaultOptions: {
    margin: {top: 50, right: 50, bottom: 50, left: 50},
    height: 500,
    width: 500,
    xKey: "x",
    yKey: "y",
    xFormatter: function(d) { return +d; },
    yFormatter: function(d) { return +d; },
    xScale: d3.scale.ordinal,
    yScale: d3.scale.ordinal,
    xAxisLabel: "",
    yAxisLabel: "",
    xAxisFormatter: function(d) { return d; },
    yAxisFormatter: function(d) { return d; },
    seriesKey: "",
    colors: d3.scale.category10(), //TODO change

    textScaleFactor: 15,
    domainMin: 0.0,
    domainMan: 100.0,
    rangeMinColor: '#FFFFFF',
    rangeMaxColor: '#D62728',
    decimalPlaces: 1,
    showLegend: true,
    legendInteractive : false,
    thresholds: undefined//e.g. [{max: 20, color: #FFF},...]
  },

  nest: null,
  x: null,
  y: null,
  xAxis: null,
  yAxis: null,

  init: function(data, options){
    this._super(data, options);

    _.each(this.data, function(d) {
        d[this.options.xKey] = this.options.xFormatter(d[this.options.xKey]);
        d[this.options.yKey] = this.options.yFormatter(d[this.options.yKey]);
    }, this);

    this.svg.attr("transform", "translate(" + this.options.margin.left + "," + this.options.margin.top + ")");

    this.createScales();
    this.createAxes();
    this.draw();
    this.drawAxes();

    return this;
  },

  parseData: function(data) {
    this.data = data;

    // Nest the data by series.
    var seriesKey = this.options.seriesKey;
    this.nest = d3.nest()
      .key(_.isFunction(seriesKey) ? seriesKey : function(d) { return d[seriesKey]; })
      .entries(this.data);
  },

  createScales: function() {
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;

    this.x = this.options.xScale()
      .domain(d3.extent(this.data, function(d) { return d[xKey]; }))
      .range([0, this.options.width]);

    this.y = this.options.yScale()
      .domain(d3.extent(this.data, function(d) { return d[yKey]; }))
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
        .attr("x", this.options.width - 10)
        .attr("y", -6)
        .attr("dx", ".71em")
        .style("text-anchor", "end")
        .text(this.options.xAxisLabel);

    this.svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis)
      .append("text")
        .attr("transform", "rotate(90)")
        .attr("y", -18)
        .attr("dy", ".71em")
        .style("text-anchor", "beginning")
        .text(this.options.yAxisLabel);

    d3.selectAll('.axis path, .axis line')
      .style("fill", "none")
      .style("stroke", "black")
      .style("shape-rendering", "crispEdges");
  },

  draw: function() {
    var x = this.x;
    var y = this.y;
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;
    var seriesKey = this.options.seriesKey;
    var colors = this.options.colors;

    this.svg.selectAll(".series")
      .data(d3.nest()
        .key(_.isFunction(seriesKey) ? seriesKey : function(d) { return d[seriesKey]; })
        .entries(this.data)
      )
      .enter()
      .append("g")
        .attr("id", function(s) { return s.key; })
        .attr("class", "series")
        .append("path")
          .datum(function(s) { return s.values; })
          .attr("d", d3.svg.area()
            .x(function(d) { return x(d[xKey]); })
            .y0(this.options.height)
            .y1(function(d) { return y(d[yKey]); })
          )
          .style("fill", function(d) { return colors(d[0][seriesKey]); })
          .style("fill-opacity", 0.5);
  },

  update: function(data) {
    this.parseData(data);
    this.draw();
  }
});
