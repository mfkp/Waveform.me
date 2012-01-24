require 'sinatra'
require 'net/http'
require 'uri'


# class SoundCloud < Sinatra::Base
	get '/hello' do
		'hello world'
	end

	get '/get/:url' do
	  res = Net::HTTP.get_response URI.parse(URI.unescape(params[:url]))
	  content_type 'image/png'
	  res.body
	end

	not_found do
	  'So what happened was...' + env['sinatra.error'].message
	end

	# start the server if ruby file executed directly
	# run! if app_file == $0
# end