defmodule Ws.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    port = Application.get_env(:ws, :port)

    children = [
      # Starts a worker by calling: Ws.Worker.start_link(arg)
      # {Ws.Worker, arg}
      {Plug.Cowboy,
       scheme: :http,
       plug: Ws.Router,
       options: [
         port: port,
         dispatch: dispatch(),
         protocol_options: [idle_timeout: :infinity]
       ]}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Ws.Supervisor]
    Supervisor.start_link(children, opts)
  end

  defp dispatch do
    [
      {:_, [
        {"/ws", WS.Message.SocketHandler, []},
        {:_, Plug.Cowboy.Handler, {Ws.Router, []}}
      ]}
    ]
  end
end
