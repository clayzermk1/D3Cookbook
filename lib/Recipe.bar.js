Recipe['bar'] = Recipe.extend({
  defaultOptions: {
    margin: {top: 50, right: 50, bottom: 50, left: 50},
    height: 500,
    width: 500,
    lData: [],
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
  x: null,
  x1: null,
  y: null,
  l: null,
  xAxis: null,
  yAxis: null,
  lAxis: null,

  init: function(options){
    this._super(options);

    this.svg.attr("transform", "translate(" + this.options.margin.left + "," + this.options.margin.top + ")");

    this.parseData();

    this.createScales();
    this.drawVis();
    this.createAxes();

    return this;
  },

  parseData: function() {
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

    // Nest the data by x and then series.
    var xKey = this.options.xKey;
    var seriesKey = this.options.seriesKey;
    this.nest = d3.nest()
      .key(function(d) { return d[xKey]; })
      .key(function(d) { return d[seriesKey]; })
      .entries(this.options.data);

    // Parse any line data.
    if (!_.isEmpty(this.options.lData)) {
      _.each(this.options.lData, function(d) {
        try {
          d[this.options.lKey] = this.options.lFormatter(d[this.options.lKey]);
        } catch (e) {
        if (!(e instanceof TypeError)) {
          throw e;
        }
      }
      }, this);
    }
  },

  createScales: function() {
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;
    var lKey = this.options.lKey;
    var seriesKey = this.options.seriesKey;

    this.x = this.options.xScale()
      .domain(_.chain(this.options.data).pluck(xKey).uniq().value())
      .rangeRoundBands([0, this.options.width], 0.1);

    this.x1 = this.options.xScale()
      .domain(_.chain(this.options.data).pluck(seriesKey).uniq().value())
      .rangeRoundBands([0, this.x.rangeBand()]);

    this.y = this.options.yScale()
      .domain([0, d3.max(this.options.data, function(d) { return d[yKey]; })])
      .range([this.options.height, 0])
      .nice();

    if (!_.isEmpty(lKey)) {
      this.l = this.options.lScale()
        .domain(d3.extent(this.options.lData, function(d) { return d[lKey]; }))
        .range([this.options.height, 0])
        .nice();
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

  drawVis: function() {
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
      .attr("class", function(s) { return "bar " + s.key; })
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
            .datum(this.options.lData)
            .attr("d", d3.svg.line()
              .x(function(d) { return x(d[xKey]); })
              .y(function(d) { return l(d[lKey]); })
            )
            .style("fill", 'none')
            .style("stroke", this.options.lColor)
            .style("stroke-width", '1px');
    }
  },

  update: function(options) {
    this._super(options);

    this.createScales();

    this.drawVis();

    this.svg.selectAll(".axis").remove();
    this.createAxes();
  }
});
