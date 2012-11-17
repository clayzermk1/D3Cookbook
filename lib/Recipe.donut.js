Recipe['donut'] = Recipe['pie'].extend({
  defaultOptions: {
    r: 250,
    rh: 150,
    pathStroke: "#fff",
    valueFormatter: function(v) { return +v; }
  }
});
