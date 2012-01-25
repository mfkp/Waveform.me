require 'sinatra'
require 'net/http'
require 'uri'

get '/get/*' do |url|
  if !url.match(/^http:\/\//)
  	url.sub!(/^http:\//, 'http://')
  end
  res = Net::HTTP.get_response URI.parse(URI.unescape(url))
  content_type 'image/png'
  res.body
end