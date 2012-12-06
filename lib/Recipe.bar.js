Recipe['bar'] = Recipe['_cartesian'].extend({ //TODO need to migrate to new cartesian model!
  defaultOptions: {
    xAxisFormatter: function(d) { return d; },
    yAxisFormatter: d3.format(".0%"),
    xFormatter: function(d) { return d; },
    yFormatter: function(d) { return +d; }
  },

  createScales: function() {
    this.x = d3.scale.ordinal()
      .domain(
        _.chain(this.data.series)
          .reduce(function(m, d) {
            return m.concat(d.data);
          }, [])
          .pluck("x")
          .uniq()
          .sortBy("value")
          .value()
      )
      .rangeRoundBands([0, this.options.width], 0.1);

    this.y = d3.scale.linear()
      .domain([0, d3.max(this.data, function(d) { return d; })]) //TODO check this.
      .range([this.options.height, 0]);
  },

  draw: function() {
    var x = this.x;
    var y = this.y;
    var height = this.options.height;

    _.each(this.data.series, function(s) {
      this.svg
        .append("g")
        .attr("id", s.label)
        .attr("class", "series")
        .selectAll(".bar")
        .data(s.data)
        .enter()
        .append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.x); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.y); })
          .attr("height", function(d) { return height - y(d.y); })
          .style("fill", s.style && s.style['fill'] ? s.style['fill'] : 'steelblue');
    }, this);
  }
});
