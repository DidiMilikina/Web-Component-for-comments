"use strict";

let gulp = require("gulp"),
	autoprefixer = require("gulp-autoprefixer"),
	livereload = require("gulp-livereload"),
	sass = require("gulp-sass"),
	notify = require("gulp-notify"),
	uglify = require("gulp-uglify"),
	concat = require("gulp-concat"),
	cleanCSS = require("gulp-clean-css"),
	rename = require("gulp-rename"),
	del = require("del"),
	moment = require("moment"),
	newer = require("gulp-newer"),
	babel = require("gulp-babel");


/**
* Unify all scripts to work with source and destination paths.
* For more custom paths, please add them in this object
*/
const paths = {
	source: {
		scripts: "src/scripts/",
		sass: "src/sass/",
	},
	destination: {
		scripts: "dist/scripts/",
		css: "dist/css/",
	}
};

gulp.task("sass", function () {
	return gulp
		.src(paths.source.sass + "**/*.scss")
		.pipe(sass().on("error", sass.logError))
		.pipe(autoprefixer())
		.pipe(gulp.dest(paths.destination.css))
		.pipe(notify({
			onLast: true,
			title: "Sass compiled successfully.",
			message: getFormatDate()
		}));
});

gulp.task("cssmin", function () {
	gulp
		.src(paths.destination.css + "style.css")
		.pipe(cleanCSS({ compatibility: 'ie8' }))
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest(paths.destination.css))
		.pipe(notify({ message: "Successfully minified master.min.css" }))
});

// The files to be watched for minifying. If more dev js files are added this
// will have to be updated.
gulp.task("watch", function () {
	livereload.listen();

	gulp.watch(paths.source.sass + "**/*.scss", ["sass"]);
	gulp.watch(paths.source.scripts + "**/*.js", ["minifyScripts"]);

	// Once the CSS file is build, minify it.
	gulp.watch(paths.destination.css + "style.css", ["cssmin"]);
});

gulp.task("minifyScripts", function () {
	// Add separate folders if required.
	gulp
		.src([
			paths.source.scripts + "vendor/*.js",
			paths.source.scripts + "inc/*.js",
			paths.source.scripts + "scripts.js"
		])
		.pipe(babel())
		.pipe(concat("bundle.min.js"))
		.pipe(uglify())
		.pipe(gulp.dest(paths.destination.scripts));
});


// This will take care of rights permission errors if any
gulp.task("cleanup", function () {
	del(paths.destination.scripts + "bundle.min.js");
	del(paths.destination.css + "*.css");
});

// Will delete .git files so that you can use it on your own repository
gulp.task("reset", function () {
	del(".git");
	del(".DS_Store");

	// @TODO: create a command that will rename all functions and comments
	// to use the one the developer needs.
});

// What will be run with simply writing "$ gulp"
gulp.task("default", [
	"sass",
	"watch",
	"minifyScripts",
	"cssmin",
]);

// Print the current date formatted. Used for the script compile notify messages.
function getFormatDate() {
	return moment().format("LTS");
}