require 'sinatra'
require 'net/http'
require 'uri'


# class SoundCloud < Sinatra::Base
	get '/get/*' do |path|
	  res = Net::HTTP.get_response URI.parse(URI.unescape(path))
	  content_type 'image/png'
	  res.body
	end

	# start the server if ruby file executed directly
	# run! if app_file == $0
# end