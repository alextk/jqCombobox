require 'rubygems'
gem 'rego-ruby-ext'
require "rego-ruby-ext"
gem 'rego-js-builder'
require "rego-js-builder"
gem 'rake-hooks'
require 'rake/hooks'

project = JsProjectBuilder.new(
  :name => 'jqCombobox',
  :description => 'jQuery plugin for creating styled select box (combobox)',
  :file_name => 'jquery.combobox.js',
  :js_files => %w{base.js  combobox.js  single_selection_model.js  multiple_combobox.js  multiple_selection_model.js},
  :sass => true
)
JsProjectBuilder::Tasks.new(project)

