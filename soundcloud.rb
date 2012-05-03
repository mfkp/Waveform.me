require 'sinatra'
require 'sinatra/jsonp'
require 'open-uri'
require 'base64'

get '/' do
  erb :index
end

get '/docs' do
  erb :docs
end

#simple soundcloud image proxy so we can serve images through the same domain, with jsonp and base64 images
get '/get/*' do |url|
  if !url.match(/^http:\/\//)
    url.sub!(/^http:\//, 'http://')
  end
  image = open(url) {|f| f.read }
  return_image = Base64.encode64(image)
  type_prefix = "data:image/#{File.extname(url).gsub(/\./, '').sub(/jpg/, 'jpeg')};base64,"
  jsonp type_prefix + return_image, params[:callback]
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