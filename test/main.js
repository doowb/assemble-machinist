/**
 * Copyright (c) 2014, Brian Woodward, contributors.
 * Licensed under the MIT License (MIT).
 */

'use strict';

var path = require('path');
var assert = require('assert');
var should = require('should');
var rimraf = require('rimraf');
var assemble = require('assemble');

var plugin = require('..');
var outpath = path.join(__dirname, './out-fixtures');

describe('machinist', function () {
  var instance = null;
  var machinist = null;

  beforeEach(function (done) {
    instance = assemble.create();
    machinist = plugin(instance);
    rimraf(outpath, done);
  });
  afterEach(function (done) {
    rimraf(outpath, done);
  });

  it('should return a stream', function (done) {
    var stream = machinist();
    should.exist(stream);
    should.exist(stream.on);
    done();
  });

  it('should run one middleware', function (done) {
    var called = 0;
    machinist
      .use(function (files, metalsmith, callback) {
        called++;
        files.forEach(function (file) {
          file.data.title = (file.data.title || '').toUpperCase();
        });
        callback();
      });

    var instream = instance.src(path.join(__dirname, 'fixtures/templates/*.hbs'));
    var outstream = instance.dest(outpath);

    instream
      .pipe(machinist())
      .pipe(outstream);

    outstream.on('error', done);
    outstream.on('end', function () {
      called.should.equal(1);
      instance.files.forEach(function (file) {
        /[ABCD]/.test(file.contents.toString()).should.be.true;
      });
      done();
    });

  });

  it('should run multiple middleware', function (done) {
    var called = 0;
    var middleware = function (files, metalsmith, callback) {
      called++;
      callback();
    };

    machinist
      .use(middleware)
      .use(middleware)
      .use(middleware)
      .use(middleware)
      .use(middleware);

    var instream = instance.src(path.join(__dirname, 'fixtures/templates/*.hbs'));
    var outstream = instance.dest(outpath);

    instream
      .pipe(machinist())
      .pipe(outstream);

    outstream.on('error', done);
    outstream.on('end', function () {
      called.should.equal(5);
      done();
    });

  });

});