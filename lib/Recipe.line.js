Recipe['line'] = Recipe['_cartesian'].extend({
  draw: function() {
    var x = this.x;
    var y = this.y;

    this.data.series.forEach(function(s) {
      this.svg.append("path")
        .datum(s.data)
        .attr("class", "line")
        .style("fill", s.style && s.style['fill'] ? s.style['fill'] : 'none')
        .style("stroke", s.style && s.style['stroke'] ? s.style['stroke'] : 'steelblue')
        .style("stroke-width", s.style && s.style['stroke-width'] ? s.style['stroke-wdith'] : '1.5px')
        .attr("d", d3.svg.line()
          .x(function(d) { return x(d.x); })
          .y(function(d) { return y(d.y); })
        );
    }, this);
  }
});
