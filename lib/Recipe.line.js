Recipe['line'] = Recipe['_cartesian'].extend({
  drawGraph: function() {
    var x = this.x;
    var y = this.y;
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;
    var seriesKey = this.options.seriesKey;
    var colors = this.options.colors;

    this.series = this.svg.selectAll(".series")
      .data(this.nest);

    this.series
      .enter()
      .append("g")
        .attr("id", function(s) { return s.key; })
        .attr("class", "series")
        .append("path");

    this.series.exit().remove();

    this.series
      .data(this.nest)
      .select("path")
        .datum(function(s) {
          return s.values;})
        .attr("d", d3.svg.line()
          .x(function(d) { return x(d[xKey]); })
          .y(function(d) { return y(d[yKey]); })
        )
        .style("fill", 'none')
        .style("stroke", function(d) { return colors(d[seriesKey]); })
        .style("stroke-width", '1.5px');
  }
});
