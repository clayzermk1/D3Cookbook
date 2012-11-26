Recipe['area'] = Recipe['_cartesian'].extend({
  defaultOptions: {
    xAxisFormatter: d3.time.format("%d-%b-%y").format,
    yAxisFormatter: function(d) { return d; },
    xFormatter: d3.time.format("%d-%b-%y").parse,
    yFormatter: function(d) { return +d; }
  },

  createScales: function() {
    this.x = d3.time.scale()
      .domain([_min(this.data.series, "x"), _max(this.data.series, "x")])
      .range([0, this.options.width]);

    this.y = d3.scale.linear()
      .domain([0, _max(this.data.series, "y")])
      .range([this.options.height, 0]);
  },

  draw: function() {
    var x = this.x;
    var y = this.y;

    this.data.series.forEach(function(s) {
      this.svg
        .append("g")
          .attr("id", s.label)
          .attr("class", "series")
          .append("path")
            .datum(s.data)
            .attr("class", "area")
            .style("fill", s.style && s.style['fill'] ? s.style['fill'] : 'steelblue')
            .attr("d", d3.svg.area()
              .x(function(d) { return x(d.x); })
              .y0(this.options.height)
              .y1(function(d) { return y(d.y); })
            );
    }, this);
  }
});
