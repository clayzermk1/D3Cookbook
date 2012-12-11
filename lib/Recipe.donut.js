Recipe['donut'] = Recipe['pie'].extend({
  defaultOptions: {
    margin: {top: 50, right: 50, bottom: 50, left: 50},
    height: 500,
    width: 500,
    r: 250,
    rh: 150,
    labelKey: "label",
    valueKey: "value",
    labelFormatter: function(d) { return d; },
    valueFormatter: function(d) { return d; },
    colors: d3.scale.category10()
  }
});
