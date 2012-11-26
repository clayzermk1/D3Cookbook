Recipe['geo'] = Recipe.extend({
  defaultOptions: {
    "projection": "mercator",
    "origin": [0, 0],
    "zoom": 1.0
  },

  init: function(recipe){
    this.options = _.defaults(recipe.options, this.defaultOptions);
    this.svg = recipe.svg;
    this.update(recipe.data);
    return this;
  },

  draw: function() {
    var xyproj = d3.geo[this.options.projection](this.options.origin);

    switch (this.options.projection) {
      case "mercator":
        xyproj = xyproj
          //.scale(Math.max(this.options.width / 960, this.options.height / 500) * 100 * this.options.zoom)
          .scale(Math.min(this.options.width, this.options.height) * (Math.min(this.options.width, this.options.height) / 500) * this.options.zoom)
          //.translate([( (-this.options.origin[0] / 180) * this.options.zoom * 500) + (this.options.width / 2), ( (this.options.origin[1] / 180) * this.options.zoom * 500) + (this.options.height / 2)]);
          .translate([this.options.width / 2, (this.options.height / 2) + (0.1 * this.options.height)]);

        this.svg
          .selectAll("path")
            .data(this.data.features)
            .enter()
            .append("path")
              .attr("d", d3.geo.path().projection(xyproj));
        break;
      case "albers":
        var pdiff = 180 * this.options.height / 500 * this.options.zoom / 3;

        xyproj = xyproj
          .parallels([ this.options.origin[1] + pdiff, this.options.origin[1] - pdiff + 0.00001 ]);
          //.scale(Math.min(this.options.width, this.options.height) * 0.25 * this.options.zoom);

        this.svg
          .selectAll("path")
            .data(this.data.features)
            .enter()
            .append("path")
              .attr("d", d3.geo.path().projection(xyproj));
        break;
      case "albersUsa":
        xyproj = xyproj
          //.scale( (Math.min(this.options.width, this.options.height) / 2) * 4 * this.options.zoom)
          //.scale(Math.min(this.options.width, this.options.height) * Math.max( (this.options.width / 960), (this.options.height / 500) ) * 2 * this.options.zoom)
          .scale(Math.min(this.options.width, this.options.height) * (Math.max(this.options.width, this.options.height) / 1000) * this.options.zoom)
          .translate([this.options.width / 2, this.options.height / 2]);

        this.svg
          .selectAll("path")
            .data(this.data.features)
            .enter()
            .append("path")
              .attr("d", d3.geo.path().projection(xyproj));
        break;
      case "orthographic": //TODO broken because d3.geo.circle.clip API is not finalized in 3.0.0pre
        xyproj = xyproj
          .scale( (Math.min(this.options.width, this.options.height) / 2) * this.options.zoom)
          .translate([this.options.width / 2, this.options.height / 2]);

        this.svg
          .selectAll("path")
            //.data(this.data.features.map(d3.geo.circle().origin(this.options.origin)))
            .data(this.data.features) //TODO fix this, causes the back of the world to show through
            .enter()
            .append("path")
              .attr("d", d3.geo.path().projection(xyproj));
        break;
      default:
        this.svg
          .selectAll("path")
            .data(this.data.features)
            .enter()
            .append("path")
              .attr("d", d3.geo.path().projection(xyproj));
        break;
    }
  }
});
