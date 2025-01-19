defmodule WS.MixProject do
  use Mix.Project

  def project do
    [
      app: :ws,
      version: "0.1.0",
      elixir: "~> 1.18.1",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      extra_applications: [:logger],
      mod: {Ws.Application, []}
    ]
  end

  defp deps do
    [
      {:phoenix_pubsub, "~> 2.1"},
      {:jason, "~> 1.4"},
      {:cors_plug, "~> 3.0"},
      {:plug_cowboy, "~> 2.6"},
      {:httpoison, "~> 2.0"},
      {:prometheus_ex, "~> 3.1"},
      {:prometheus_plugs, "~> 1.1"},
      {:telemetry, "~> 1.2"}
    ]
  end
end
