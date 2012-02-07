require 'sinatra'
require 'net/http'
require 'uri'

get '/' do
  erb :index
end

get '/docs' do
  erb :docs
end

#simple soundcloud image proxy so we can serve images through the same domain
get '/get/*' do |url|
  if !url.match(/^http:\/\//)
  	url.sub!(/^http:\//, 'http://')
  end
  res = Net::HTTP.get_response URI.parse(URI.unescape(url))
  content_type 'image/png'
  res.body
end

get '/examples/:type' do
  case params[:type]
  when 'cigarette'
  	erb :cigarette
  when 'record'
  	erb :record
  when 'rainbow'
  	erb :rainbow
  end
end