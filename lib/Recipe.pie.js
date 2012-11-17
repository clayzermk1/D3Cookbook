Recipe['pie'] = Recipe.extend({
  defaultOptions: {
    r: 250,
    rh: 0,
    pathStroke: "#fff",
    valueFormatter: function(v) { return +v; }
  },

  init: function(recipe){
    this.options = _defaults(recipe.options, this.defaultOptions);
    this.svg = recipe.svg.attr("transform", "translate(" + this.options.width / 2 + "," + this.options.height / 2 + ")");
    this.update(recipe.data);
    return this;
  },

  draw: function() {
    var arc = d3.svg.arc()
      .outerRadius(this.options.r - Math.max(this.options.margin.top, this.options.margin.right, this.options.margin.bottom, this.options.margin.left))
      .innerRadius(this.options.rh);

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.value; });

    this.data.forEach(function(d) {
      d.value = this.options.valueFormatter(d.value);
    }, this);

    var g = this.svg.selectAll(".arc")
        .data(pie(this.data))
      .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return d.data.color; })
        .style("stroke", this.options.pathStroke);

    g.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.label; });
  }
});
