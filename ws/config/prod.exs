import Config

config :ws,
  port: String.to_integer(System.get_env("PORT") || "8080"),
  url: System.get_env("URL"),
  cors_origin: System.get_env("CORS_ORIGIN")
