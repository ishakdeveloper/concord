defmodule WSWeb.Router do
  use WSWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", WSWeb do
    pipe_through :api

    get "/health", HealthController, :check
  end
end
