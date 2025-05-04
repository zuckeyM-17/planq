require 'sinatra'
require 'sinatra-websocket'
require 'json'
require 'faraday'
require 'dotenv/load'

set :server, 'thin'
set :sockets, []
set :public_folder, "#{File.dirname(__FILE__)}/../dist"
set :bind, '0.0.0.0'
set :port, 4567

# LLM APIを呼び出す関数
def call_llm_api(message)
  api_key, api_endpoint = api_credentials
  conn = create_api_connection(api_endpoint, api_key)
  response = send_api_request(conn, message)

  return "エラーが発生しました: #{response.status} - #{response.body}" unless response.status == 200

  process_api_response(response)
rescue => e
  "エラーが発生しました: #{e.message}"
end

# API認証情報を取得
def api_credentials
  api_key = ENV['LLM_API_KEY'] || 'your_api_key_here'
  api_endpoint = ENV['LLM_API_ENDPOINT'] || 'https://api.anthropic.com/v1/messages'
  [api_key, api_endpoint]
end

# API接続を作成
def create_api_connection(api_endpoint, api_key)
  Faraday.new(url: api_endpoint) do |faraday|
    faraday.headers['Content-Type'] = 'application/json'
    faraday.headers['x-api-key'] = api_key
    faraday.headers['anthropic-version'] = '2023-06-01'
  end
end

# APIリクエストを送信
def send_api_request(conn, message)
  conn.post do |req|
    req.body = {
      model: 'claude-3-7-sonnet-20250219',
      messages: [
        { role: 'user', content: message },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    }.to_json
  end
end

# APIレスポンスを処理
def process_api_response(response)
  result = JSON.parse(response.body)
  puts "APIレスポンス: #{result.inspect}"

  if result['content'] && result['content'][0] &&
     (result['content'][0]['text'] || result['content'][0]['type'] == 'text')
    result['content'][0]['text']
  else
    "APIレスポンスの形式が予期しないものでした: #{result.inspect}"
  end
end

# WebSocketエンドポイント
get '/ws' do
  if request.websocket?
    request.websocket do |ws|
      ws.onopen do
        settings.sockets << ws
        puts 'WebSocket接続が確立されました'
      end

      ws.onmessage do |msg|
        puts "メッセージを受信しました: #{msg}"
        data = JSON.parse(msg)

        # LLM APIを呼び出し、結果をストリーミング形式で返す
        Thread.new do
          response = call_llm_api(data['message'])

          # 実際のストリーミングの代わりに、文字ごとに送信する簡易的な実装
          response.each_char.with_index do |char, i|
            ws.send({ type: 'stream', content: char, done: i == response.length - 1 }.to_json)
            sleep(0.01) # 文字送信の間隔
          end
        end
      end

      ws.onclose do
        settings.sockets.delete(ws)
        puts 'WebSocket接続が閉じられました'
      end
    end
  else
    halt 400, 'WebSocketリクエストではありません'
  end
end

# フロントエンドのルート
get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

# 環境変数の設定用のエンドポイント（開発用）
get '/env' do
  content_type :json
  {
    api_key: ENV['LLM_API_KEY'] ? 'set' : 'not set',
    api_endpoint: ENV['LLM_API_ENDPOINT'] || 'not set',
  }.to_json
end
