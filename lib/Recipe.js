var Recipe = Class.extend({
  defaultOptions: {
    margin: {top: 50, right: 50, bottom: 50, left: 50},
    height: 500,
    width: 500
  },

  data: null,
  options: null,
  svg: null,

  init: function(data, options){
    this.options = _.defaults(options, this.defaultOptions);
    this.svg = d3.select(this.options.selector ? this.options.selector : "body").append("svg")
        .attr("width", this.options.width + this.options.margin.left + this.options.margin.right)
        .attr("height", this.options.height + this.options.margin.top + this.options.margin.bottom)
      .append("g");

    this.update(data);

    if (options.recipe) {
      return this.cook(this.options.recipe);
    } else {
      return this;
    }
  },

  cook: function(recipeName) {
    return new Recipe[recipeName](this);
  },

  update: function(data) {
    this.data = data;
    this.draw();
    return this;
  },

  draw: function() {}
});
