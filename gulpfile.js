// jshint undef: true, unused: true, strict: true, node: true, laxcomma: true
'use strict';

var gulp = require('gulp')
    , clear = require('clear')
    , exec = require('child_process').exec
    , spawn = require('child_process').spawn
    , gutil = require('gulp-util')
    , counter = 0
    , node = null
    ;

var build = 'go build';
var generate = 'go generate';
var run = './go-kit-graphql-todo';

gulp.task('default', ['generate', 'build', 'run', 'watch']);

gulp.task('watch', function() {
    gulp.watch('**/*.go', ['clear', 'build', 'run']);
    // We don't need to run 'build' after generate.
    // If any *.go files are added/updated then 'build'
    // will trigger anyway
    // XXX(nicolaiskogheim): I don't know if this behaviour creates
    //                       race conditions.
    gulp.watch('**/*.graphql', ['clear', 'generate']);
});

gulp.task('clear', [], function (cb) {
    clear();
    cb();
});

gulp.task('build', [], function (cb) {
    runCommand(build, cb);
});

gulp.task('generate', [], function (cb) {
    runCommand(generate, cb);
});

gulp.task('run', ['build'], function(cb) {
    gutil.log(gutil.colors.yellow('Run number ' + counter));

    if (node) {
        node.kill();
        // Delay this so we get 'Starting ...' after 'Server quit ...'
        setTimeout(function() {
            gutil.log(gutil.colors.cyan('Starting server.'));
        }, 5);
    }

    node = spawn(run, [], {stdio: 'inherit'});
    node.on('exit', function (code, signal) {
        gutil.log(gutil.colors.cyan('Server quit. Exit code: ', code, '. Signal: ', signal));
    });

    counter++;
    cb();
});

process.on('exit', function() {
    if (node) node.kill();
});

function runCommand(cmd, cb) {
    exec(build, function (err, stdout, stderr) {
        if (err) {
            gutil.log(gutil.colors.red(cmd + ': '), gutil.colors.red(stderr));
            gutil.log(gutil.colors.red('NOT RESTARTING APP'));
        } else {
            if (stdout) {
                gutil.log(gutil.colors.green(cmd + ': '), gutil.colors.green(stdout));
            }
            gutil.log(gutil.colors.green('RESTARTING APP'));
        }
        cb();
    });
}

