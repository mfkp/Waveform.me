require 'rubygems'
require 'sinatra'
require 'bundler'
require 'soundcloud'

Bundler.require

root_dir = File.dirname(__FILE__)

set :environment, :production
set :root,  root_dir
set :app_file, File.join(root_dir, 'soundcloud.rb')
disable :run

run Sinatra::Application