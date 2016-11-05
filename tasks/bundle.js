/*
Build a bundled app.js file using browserify
*/
module.exports = function(grunt) {

  var async = require("async");
  var babel = require("babelify");
  var browserify = require("browserify");
  var exorcist = require("exorcist");
  var fs = require("fs");

  grunt.registerTask("bundle", "Build app.js using browserify", function(mode) {
    //run in dev mode unless otherwise specified
    mode = mode || "dev";
    var done = this.async();

    //specify starter files here - if you need additionally built JS, just add it.
    var seeds = {
      "./src/js/main.js": "build/main_app.js",
      "./src/js/president.js": "build/president_app.js",
      "./src/js/senate.js": "build/senate_app.js",
      "./src/js/house.js": "build/house_app.js",
      "./src/js/statesenate.js": "build/statesenate_app.js",
      "./src/js/stateassembly.js": "build/stateassembly_app.js",
      "./src/js/sfsupes.js": "build/sfsupes_app.js",
      "./src/js/sfmeasures.js": "build/sfmeasures_app.js",
      "./src/js/caprop55.js": "build/caprop55_app.js",
      "./src/js/caprop56.js": "build/caprop56_app.js",
      "./src/js/caprop62.js": "build/caprop62_app.js",
      "./src/js/caprop63.js": "build/caprop63_app.js",
      "./src/js/caprop64.js": "build/caprop64_app.js",
      "./src/js/measureRR.js": "build/measureRR_app.js",
      "./src/js/homepage.js": "build/homepage.js"
      
    };

    async.forEachOf(seeds, function(dest, src, c) {
      var b = browserify({ debug: mode == "dev" });
      b.transform(babel);

      //make sure build/ exists
      grunt.file.mkdir("build");
      var output = fs.createWriteStream(dest);

      b.add(src);
      var assembly = b.bundle();

      assembly.on("error", function(err) {
        grunt.log.errorlns(err.message);
        done();
      });
      var mapFile = dest + ".map"

      if (mode == "dev") {
        //output sourcemap
        assembly = assembly.pipe(exorcist(mapFile, null, null, "."));
      }
      assembly.pipe(output).on("finish", function() {
        if (mode != "dev") return;

        //correct path separators in the sourcemap for Windows
        var sourcemap = grunt.file.readJSON(mapFile);
        sourcemap.sources = sourcemap.sources.map(function(s) { return s.replace(/\\/g, "/") });
        grunt.file.write(mapFile, JSON.stringify(sourcemap, null, 2));

        c();
      });
    }, done);

  });

};
