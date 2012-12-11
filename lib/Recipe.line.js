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
