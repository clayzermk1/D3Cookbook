Recipe['bar'] = Recipe['_cartesian'].extend({ //TODO need to migrate to new cartesian model!
  defaultOptions: {
    margin: {top: 50, right: 50, bottom: 50, left: 50},
    height: 500,
    width: 500,
    xKey: "x",
    yKey: "y",
    xFormatter: function(d) { return d; },
    yFormatter: function(d) { return d; },
    xScale: d3.scale.ordinal,
    yScale: d3.scale.linear,
    xAxisLabel: "",
    yAxisLabel: "",
    xAxisFormatter: function(d) { return d; },
    yAxisFormatter: function(d) { return d; },
    seriesKey: "",
    colors: d3.scale.category10()
  },

  bar: null,

  createScales: function() {
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;

    this.x = this.options.xScale()
      .domain(_.chain(this.data).pluck(xKey).uniq().value())
      .rangeRoundBands([0, this.options.width], 0.1);

    this.y = this.options.yScale()
      .domain(d3.extent(_.chain(this.data).pluck(yKey).uniq().value(), function(d) { return d; }))
      .range([this.options.height, 0])
      .nice();
  },

  updateScales: function() {
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;
    this.x.domain(_.chain(this.data).pluck(xKey).uniq().value());
    this.y.domain(d3.extent(_.chain(this.data).pluck(yKey).uniq().value(), function(d) { return d; }));
  },

  createGraph: function() {
    this.series = this.svg.selectAll(".series")
      .data(this.nest);

    this.series
      .enter()
      .append("g")
        .attr("id", function(s) { return s.key; })
        .attr("class", "series");

    this.series.exit().remove();

    this.bar = this.series.selectAll(".bar")
      .data(function(s) { return s.values; });

    var bar = this.bar
      .enter()
      .append("g")
        .attr("class", "bar");

    bar.append("rect");
    bar.append("text");

    this.bar.exit().remove();

    this.drawGraph();
  },

  drawGraph: function() {
    var x = this.x;
    var y = this.y;
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;
    var seriesKey = this.options.seriesKey;
    var colors = this.options.colors;
    var height = this.options.height;
    var yAxisFormatter = this.options.yAxisFormatter;

    this.series.data(this.nest);

    this.bar.data(function(s) { return s.values; });

    this.bar.selectAll("rect")
      .attr("x", function(d) { return x(d[xKey]); })
      .attr("y", function(d) { return y(d[yKey]); })
      .attr("width", x.rangeBand())
      .attr("height", function(d) { return height - y(d[yKey]); })
      .style("fill", function(d) { return colors(d[seriesKey]); })
      .style("fill-opacity", 0.5)
      .style("stroke", function(d) { return colors(d[seriesKey]); })
      .style("stroke-width", '1.5px');

    this.bar.selectAll("text")
      .attr("x", function(d) { return x(d[xKey]) + (x.rangeBand() / 2); })
      .attr("y", function(d) { return y(d[yKey]) + 12; })
      .attr("text-anchor", "middle")
      .text(function(d) { return yAxisFormatter(d[yKey]); })
      .style("fill", "#fff")
      .style("font-size", "10px");
  }
});
