import Config

config :ws,
  port: String.to_integer(System.get_env("PORT") || "4001"),
  url: System.get_env("URL") || "ws://localhost:4001",
  cors_origin: System.get_env("CORS_ORIGIN") || "http://localhost:3000"

import_config "#{config_env()}.exs"
