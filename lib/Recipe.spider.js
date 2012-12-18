Recipe['spider'] = Recipe.extend({
  defaultOptions: {
    margin: {top: 50, right: 50, bottom: 50, left: 50},
    height: 500,
    width: 500,
    r: 250,
    rh: 0,
    xKey: "x",
    yKey: "y",
    xFormatter: function(d) { return d; },
    yFormatter: function(d) { return d; },
    xScale: d3.scale.ordinal,
    yScale: d3.scale.linear,
    xAxisFormatter: function(d) { return d; },
    yAxisFormatter: function(d) { return d; },
    seriesKey: "",
    colors: d3.scale.category10()
  },

  nest: null,
  x: null,
  y: null,
  xAxis: null,
  yAxis: null,

  init: function(options){
    this._super(options);

    this.svg.attr("transform", "translate(" + ( (this.options.width / 2) + this.options.margin.left ) + "," + ( (this.options.height / 2) + this.options.margin.top ) + ")");

    this.parseData();

    this.createScales();
    this.drawAxes();
    this.drawVis();

    return this;
  },

  parseData: function() {
    _.each(this.options.data, function(d) {
      try {
        d[this.options.xKey] = this.options.xFormatter(d[this.options.xKey]);
      } catch (e) {
        if (!(e instanceof TypeError)) {
          throw e;
        }
      }
      try {
        d[this.options.yKey] = this.options.yFormatter(d[this.options.yKey]);
      } catch (e) {
        if (!(e instanceof TypeError)) {
          throw e;
        }
      }
    }, this);

    // Nest the data by series.
    var seriesKey = this.options.seriesKey;
    this.nest = d3.nest()
      .key(_.isFunction(seriesKey) ? seriesKey : function(d) { return d[seriesKey]; })
      .entries(this.options.data);
  },

  createScales: function() {
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;

    this.x = this.options.xScale()
      .domain(_.chain(this.options.data).pluck(xKey).uniq().value())
      .rangeBands([0, 2 * Math.PI]);

    this.y = this.options.yScale()
      .domain([0, d3.max(this.options.data, function(d) { return d[yKey]; })])
      .range([this.options.rh, this.options.r])
      .nice();
  },

  drawAxes: function() {
    var x = this.x;
    var y = this.y;
    var r = this.options.r;
    var xKey = this.options.xKey;
    var xAxisFormatter = this.options.xAxisFormatter;

    var arc = d3.svg.arc()
      .outerRadius(this.options.r)
      .innerRadius(this.options.rh);

    var gridline = d3.svg.line.radial()
      .interpolate("linear-closed")
      .angle(function(d) { return x(d.x); })
      .radius(function(d) { return y(d.y); });

    this.svg
      .append("g")
      .attr("class", "y gridlines")
      .selectAll(".y.gridline")
        .data(
          _.map(_.range(y.domain()[0] + 1, y.domain()[1] + 1), function(d) {
            return _.map(x.domain(), function(d) {
              return _.extend({"x": d}, this);
            }, {"y": d});
          })
        )
        .enter()
        .append("path")
            .attr("d", function(d) {
              return gridline(d); })
            .attr("class", "y gridline");

    d3.selectAll('.gridline')
      .style("fill", "none")
      .style("stroke", "silver");

    this.yAxis = d3.svg.axis()
      .scale(this.y.copy().range([-this.options.rh, -this.options.r]))
      .orient("left")
      .tickFormat(this.options.yAxisFormatter);

    this.svg.selectAll(".y.axis")
      .data(x.domain())
      .enter()
      .append("g")
        .attr("class", "y axis")
        .attr("transform", function(d) { return "rotate(" + (x(d) * 180 / Math.PI) + ")"; })
        .call(this.yAxis)
        .append("text")
          .attr("transform", function(d) {
            return "rotate(" + (-x(d) * 180 / Math.PI) + ") translate(" + ((r + 18) * Math.sin(x(d))) + ", " + (-(r + 18) * Math.cos(x(d))) + ")"; })
          .attr("dy", ".71em")
          .style("text-anchor", function(d) {
            var rads = x(d);
            if ( (rads > 7 * Math.PI / 4 && rads < Math.PI / 4) || (rads > 3 * Math.PI / 4 && rads < 5 * Math.PI / 4) ) {
              return "middle";
            } else if (rads >= Math.PI / 4 && rads <= 3 * Math.PI / 4) {
              return "start";
            } else if (rads >= 5 * Math.PI / 4 && rads <= 7 * Math.PI / 4) {
              return "end";
            } else {
              return "middle";
            }
          })
          .text(function(d) { return xAxisFormatter(d); });

    d3.selectAll('.axis path, .axis line')
      .style("fill", "none")
      .style("stroke", "silver");

    d3.selectAll('.axis text')
      .style("fill", "#666")
      .style("font-size", "10px");
  },

  drawVis: function() {
    var x = this.x;
    var y = this.y;
    var xKey = this.options.xKey;
    var yKey = this.options.yKey;
    var colors = this.options.colors;
    var rh = this.options.rh;

    var area = d3.svg.area.radial()
      .interpolate("linear-closed")
      .angle(function(d) { return x(d[xKey]); })
      .innerRadius(function(d) { return y(rh); })
      .outerRadius(function(d) { return y(d[yKey]); });

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
      .attr("d", function(s) {
        return area(s.values); })
      .style("fill", function(d) { return colors(d.key); })
      .style("fill-opacity", 0.5)
      .style("stroke", function(d) { return colors(d.key); })
      .style("stroke-width", '1px');
  },

  update: function(options) {
    this._super(options);

    this.createScales();

    this.svg.selectAll(".axis").remove();
    this.drawAxes();

    this.drawVis();
  }
});
