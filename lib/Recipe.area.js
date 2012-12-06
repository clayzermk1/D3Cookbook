Recipe['area'] = Recipe['_cartesian'].extend({ //TODO need to migrate to new cartesian model!
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
  }
});
