/**
 * Gulp file
 *
 * @package Woostify Block
 */

'use strict';

const domain = 'wcb',
	glob = require( 'glob' ),
	gulp = require( 'gulp' ),
	babel = require( 'gulp-babel' ),
	zip = require( 'gulp-zip' ),
	del = require( 'del' ),
	sourcemaps = require( 'gulp-sourcemaps' ),
	uglify = require( 'gulp-uglify-es' ).default,
	minify = require( 'gulp-uglify' ),
	rename = require( 'gulp-rename' ),
	fs = require( 'fs' ),
	sass = require( 'gulp-sass' )( require( 'node-sass' ) ),
	globbing = require( 'gulp-css-globbing' ),
	wpPot = require( 'gulp-wp-pot' );

const pkgInfo = JSON.parse( fs.readFileSync( './package.json' ) );

// Handle console.
let handleError = function ( e ) {
	console.log( e.toString() );
	this.emit( 'end' );
};

// Create .pot file.
let _pot = ( done ) => {
	gulp.src( [ '**/*.php' ] )
		.pipe(
			wpPot( {
				domain: domain,
				package: 'Woostify Conversion Blocks',
			} )
		)
		.on( 'error', handleError )
		.pipe( gulp.dest( 'languages/' + domain + '.pot' ) );

	done();
};
gulp.task( 'pot', _pot );

// Zip task.
let _zip = ( done ) => {
	gulp.src( [
		'**/*',
		'!./{node_modules,node_modules/**/*}',
		'!./*.cache',
		'!./*.log',
		'!./*.xml',
		'!./*.lock',
		'!./*.json',
		'!./*.map',
		'!./**/*.scss',
		'!**.DS_Store',
		'!./assets/css/admin/**/*.scss}',
		'!./Gulpfile.js',
		'!./webpack.config.js',
		'!README.md',
		'!.gitignore',
		'!src/**',
		'!build/**',
		'!bundled/**',
	] )
		/*.pipe( debug( { title: 'src' } ) )*/
		.pipe( zip( 'woostify-conversion-blocks-' + pkgInfo.version + '.zip' ) )
		.pipe( gulp.dest( 'bundled' ) );

	done();
};
gulp.task( 'zip', gulp.series( _pot, _zip ) );

// Sass admin.
let _sassAdmin = ( done ) => {
	gulp.src( [ 'assets/css/admin/**/*.scss', '!assets/css/admin/**/*.css' ] )
		.pipe(
			globbing( {
				extensions: [ '.scss' ],
			} )
		)
		.pipe(
			sass( {
				outputStyle: 'expanded',
			} ).on( 'error', sass.logError )
		)
		.pipe( gulp.dest( 'assets/css/admin' ) );

	done();
};

// Js.
let _minJs = ( done ) => {
	gulp.src( [ 'assets/**/*.js', '!assets/**/*.min.js' ] )
		.pipe(
			babel( {
				presets: [ '@babel/preset-env' ],
			} )
		)
		.pipe( minify() )
		.on( 'error', handleError )
		.pipe( rename( { suffix: '.min' } ) );

	done();
};

// Watch task.
let _watch = ( done ) => {
	gulp.watch(
		[ 'assets/css/admin/**/*.scss', '!assets/css/admin/**/*.css' ],
		_sassAdmin
	);
	gulp.watch( [ 'assets/js/**/*.js', '!assets/**/*.min.js' ], _minJs );

	done();
};

gulp.task( 'default', gulp.parallel( _watch ) );
