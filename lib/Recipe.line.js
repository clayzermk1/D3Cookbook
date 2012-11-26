Recipe['line'] = Recipe['_cartesian'].extend({
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
      .domain([_min(this.data.series, "y"), _max(this.data.series, "y")])
      .range([this.options.height, 0]);
  },

  draw: function() {
    var x = this.x;
    var y = this.y;
    var g = null;

    _.each(this.data.series, function(s) {
      this.svg
        .append("g")
          .attr("id", s.label)
          .attr("class", "series")
          .append("path")
            .datum(s.data)
            .attr("class", "line")
            .attr("d", d3.svg.line()
              .x(function(d) { return x(d.x); })
              .y(function(d) { return y(d.y); })
            )
            .style("fill", s.style && s.style['fill'] ? s.style['fill'] : 'none')
            .style("stroke", s.style && s.style['stroke'] ? s.style['stroke'] : 'steelblue')
            .style("stroke-width", s.style && s.style['stroke-width'] ? s.style['stroke-wdith'] : '1.5px');
    }, this);
  }
});
