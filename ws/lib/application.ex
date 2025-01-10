defmodule Ws.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    port = Application.get_env(:ws, :port)

    children = [
      {Plug.Cowboy,
       scheme: :http,
       plug: Ws.Router,
       options: [
         port: port,
         dispatch: dispatch(),
         protocol_options: [idle_timeout: :infinity],
         transport_options: [num_acceptors: 10]
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
        {"/health", Ws.HealthCheck, []},
        {"/ws", WS.Message.SocketHandler, []},
        {:_, Plug.Cowboy.Handler, {Ws.Router, []}}
      ]}
    ]
  end
end
