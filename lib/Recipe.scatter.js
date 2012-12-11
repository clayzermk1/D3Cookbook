Recipe['scatter'] = Recipe['_cartesian'].extend({ //TODO incomplete! need updates to work dynamically.
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

    this.series = this.svg.selectAll(".series")
      .data(this.nest);

    this.series
      .enter()
      .append("g")
        .attr("id", function(s) { return s.key; })
        .attr("class", "series");

    this.series.exit().remove();

    var dot = this.series.selectAll(".dot")
      .data(function(s) {
        return s.values; });

    dot
      .enter()
      .append("circle")
        .attr("class", "dot");

    dot.exit().remove();

    this.series.selectAll(".dot")
      .data(function(s) { return s.values; })
      .attr("r", function(d) { return rFormatter(d[rKey] ? d[rKey] : 1); })
      .attr("cx", function(d) { return x(d[xKey]); })
      .attr("cy", function(d) { return y(d[yKey]); })
      .style("fill", function(d) { return colors(d[seriesKey]); })
      .style("fill-opacity", 0.5)
      .style("stroke", function(d) { return colors(d[seriesKey]); })
      .style("stroke-width", '1.5px');
  }
});
