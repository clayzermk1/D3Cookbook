Recipe['pie'] = Recipe.extend({
  defaultOptions: {
    margin: {top: 50, right: 50, bottom: 50, left: 50},
    height: 500,
    width: 500,
    r: 250,
    rh: 0,
    labelKey: "label",
    valueKey: "value",
    labelFormatter: function(d) { return d; },
    valueFormatter: function(d) { return d; },
    colors: d3.scale.category10()
  },

  init: function(data, options){
    this._super(data, options);

    this.svg.attr("transform", "translate(" + ( (this.options.width / 2) + this.options.margin.left ) + "," + ( (this.options.height / 2) + this.options.margin.top ) + ")");

    this.drawGraph();

    return this;
  },

  parseData: function(data) {
    this._super(data);

    _.each(this.options.data, function(d) {
        d[this.options.valueKey] = this.options.valueFormatter(d[this.options.valueKey]);
    }, this);
  },

  drawGraph: function() {
    var labelKey = this.options.labelKey;
    var valueKey = this.options.valueKey;
    var colors = this.options.colors;

    var arc = d3.svg.arc()
      .outerRadius(this.options.r)// - Math.max(this.options.margin.top, this.options.margin.right, this.options.margin.bottom, this.options.margin.left))
      .innerRadius(this.options.rh);

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d[valueKey]; });

    var value = this.svg.selectAll(".value")
      .data(pie(this.options.data));

    var g = value
      .enter()
      .append("g")
        .attr("class", "value");

    g.append("path");
    g.append("text");

    value.exit().remove();

    value
      .attr("id", function(d) { return d.data[labelKey]; });

    value.select("path")
      .attr("d", arc)
      .style("fill", function(d) { return colors(d.data[labelKey]); })
      .style("stroke", "#fff")
      .style("stroke-width", '1.5px');

    value.select("text")
      .text(function(d) { return d.data[labelKey]; })
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle");
  }
});
