var fs = require('fs'),
    path = require('path'),
    gutil = require('gulp-util'),
    through = require('through2'),
    mustache = require('mustache'),
    markdown = require('marked'),
    _ = require('lodash');

var _processSlide = function (file) {
  var content_md = file.contents.toString('utf8');
  var content_html = markdown(content_md);
  var template = fs.readFileSync(__dirname + '/templates/slide.mustache.html', 'utf8');
  var rendered = mustache.to_html(template, {content: content_html});

  return {
    file: file,
    section_name: path.dirname(file.relative),
    slide_name: path.basename(file.relative, '.md'),
    markdown: content_md,
    html: content_html,
    rendered: rendered
  };
};

var _processSection = function (section_name, slides) {
  var template = fs.readFileSync(__dirname + '/templates/section.mustache.html', 'utf8');
  var rendered = mustache.to_html(template, {slides: slides});

  return {
    section_name: section_name,
    rendered: rendered
  };
};

var _processPresentation = function (options, sections) {
  var template = fs.readFileSync(__dirname + '/templates/base.mustache.html', 'utf8');
  var rendered = mustache.to_html(template, _.extend({}, options, {sections: sections}));

  return _.extend({}, options, {
    sections: sections,
    rendered: rendered
  });
};

module.exports = function (options) {
  'use strict';

  options = _.extend({}, {
    title: '(Unknown title)'
  }, options);

  var slides = [];
  var sections = [];
  var presentation = null;

  return through.obj(
    function (file, enc, cb) {
      if (file.isNull()) {
        this.push(file);
        return cb();
      }

      if (file.isStream()) {
        this.emit('error', new gutil.PluginError('reveal', 'Streaming not supported'));
        return cb();
      }

      slides.push(_processSlide(file));
      cb();
    },
    function (cb) {
      sections = _.chain(slides)
        .groupBy('section_name')
        .map(function (slides, section_name) {
          return _processSection(section_name, slides);
        })
        .value();

      presentation = _processPresentation(options, sections);

      var file = slides[0].file;
      file.contents = new Buffer(presentation.rendered, 'utf8');
      this.push(file);
      cb();
    }
  );
};
