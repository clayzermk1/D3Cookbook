/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    lint: {
      //files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
      files: ['grunt.js', 'dist/*.js']
    },
    qunit: {
      files: ['test/**/*.html']
    },
    concat: {
      dist: {
        src: [
          '<banner:meta.banner>',
          '<file_strip_banner:lib/utility.js>',
          '<file_strip_banner:lib/jrclass.js>',
          '<file_strip_banner:lib/Recipe.js>',
          '<file_strip_banner:lib/Recipe.pie.js>',
          '<file_strip_banner:lib/Recipe.donut.js>',
          '<file_strip_banner:lib/Recipe._cartesian.js>',
          '<file_strip_banner:lib/Recipe.line.js>',
          '<file_strip_banner:lib/Recipe.area.js>'
        ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        curly: true,
        immed: true,
        latedef: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        loopfunc: true,
        expr: true,
        devel: true,
        debug: true
      },
      globals: {
        Class: true,
        xyz: true,
        d3: true
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('deploy', 'lint qunit concat min');
  grunt.registerTask('default', 'concat lint');

};
