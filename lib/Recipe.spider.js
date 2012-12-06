Recipe['spider'] = Recipe.extend({ //TODO incomplete! need to merge in changes from cartesian and build out in general.
  defaultOptions: {
    r: 250,
    rh: 50,
    interpolation: "cardinal-closed",
    xAxisFormatter: function(d) { return d; },
    yAxisFormatter: d3.format(".0%"),
    xFormatter: function(d) { return d; },
    yFormatter: function(d) { return +d; }
  },

  x: null,
  y: null,
  xAxis: null,
  yAxis: null,

  init: function(recipe){
    this.options = _.defaults(recipe.options, this.defaultOptions);
    this.svg = recipe.svg.attr("transform", "translate(" + ( (this.options.width / 2) + this.options.margin.left ) + "," + ( (this.options.height / 2) + this.options.margin.top ) + ")");
    this.data = recipe.data;

    // Format data.
    _.each(this.data.series, function(s) {
      _.each(s.data, function(d) {
        d.x = this.options.xFormatter(d.x);
        d.y = this.options.yFormatter(d.y);
      }, this);
    }, this);

    this.createScales();
    this.createAxes();
    this.draw();
    this.drawAxes();

    return this;
  },

  createScales: function() {
    this.x = d3.time.scale()
      .domain([
        0,
        _.chain(this.data.series)
          .reduce(function(m, d) {
            return m.concat(d.data);
          }, [])
          .pluck("x")
          .uniq()
          .sortBy("value")
          .value().length
      ])
      .range([0, 2 * Math.PI]);

    this.y = d3.scale.linear()
      .domain([0, d3.max(this.data, function(d) { return d; })]) //TODO check this
      .range([this.options.r, this.options.rh]);
  },

  createAxes: function() {
    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom")
      .tickFormat(this.options.xAxisFormatter);
    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left")
      .tickFormat(this.options.yAxisFormatter);
  },

  drawAxes: function() {
    var x = this.x;
    var y = this.y;
    var r = this.options.r;
    var rh = this.options.rh;
    var xAxisFormatter = this.options.xAxisFormatter;

    this.svg.selectAll(".axis")
      .data(d3.range(x.domain()[1]))
      .enter()
      .append("g")
        .attr("class", "axis")
        .attr("transform", function(d) { return "rotate(" + x(d) * 180 / Math.PI + ")"; })
        .call(d3.svg.axis()
          .scale(y.copy().range([-rh, -r]))
          .orient("left"))
        .append("text")
          .attr("y", -r - 12)
          .attr("dy", ".71em")
          .attr("text-anchor", "middle")
          .text(function(d) { return xAxisFormatter(d); });
  },

  draw: function() {
    var x = this.x;
    var y = this.y;
    var area = d3.svg.area.radial()
      .interpolate(this.options.interpolation)
      .angle(function(d) {
        return x(d.x); })
      .innerRadius(function(d) {
        return y(0); })
      .outerRadius(function(d) {
        return y(d.y); });

    this.svg.selectAll(".series")
      .data(this.data.series)
      .enter()
      .append("path")
        .attr("class", "layer")
        .attr("d", function(s) {
          return area(s.data); })
        .style("fill", function(s) { return s.style && s.style['fill'] ? s.style['fill'] : 'steelblue'; });
  }
});
