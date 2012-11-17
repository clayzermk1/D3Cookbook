Recipe['area'] = Recipe['_cartesian'].extend({
  draw: function() {
    var x = this.x;
    var y = this.y;

    this.data.series.forEach(function(s) {
      this.svg.append("path")
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
