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
