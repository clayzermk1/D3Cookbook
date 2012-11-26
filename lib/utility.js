// Calculates the min an array of series.
var _min = function(seriesRA, axis) {
  var min = seriesRA[0].data[0][axis],
      smin = null;

  _.each(seriesRA, function(s) {
    smin = d3.min(s.data, function(d) { return d[axis]; });
    if (smin < min) {
      min = smin;
    }
  });

  return min;
};

// Calculates the max of an array of series.
var _max = function(seriesRA, axis) {
  var max = seriesRA[0].data[0][axis],
      smax = null;

  _.each(seriesRA, function(s) {
    smax = d3.max(s.data, function(d) { return d[axis]; });
    if (smax > max) {
      max = smax;
    }
  });

  return max;
};
