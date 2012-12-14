var Recipe = Class.extend({
  defaultOptions: {
    margin: {top: 50, right: 50, bottom: 50, left: 50},
    height: 500,
    width: 500
  },

  options: null,
  svg: null,

  init: function(options){
    this.options = _.defaults(options, this.defaultOptions);
    this.svg = d3.select(this.options.selector ? this.options.selector : "body").append("svg")
        .attr("width", this.options.width + this.options.margin.left + this.options.margin.right)
        .attr("height", this.options.height + this.options.margin.top + this.options.margin.bottom)
      .append("g");

    this.parseData(this.options.data);

    return this;
  },

  parseData: function(data) {
    this.options.data = _.clone(data, true);
  },

  update: function(data) {
    // Update the data.
    if (!_.isUndefined(data)) {
      this.parseData(data);
    } else {
      this.parseData(this.options.data);
    }

    // Redraw the graph.
    this.drawGraph();
  }
});
