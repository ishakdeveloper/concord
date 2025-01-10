defmodule Ws.HealthCheck do
  @behaviour :cowboy_handler

  def init(req, state) do
    response = %{
      status: "healthy",
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      uptime: :erlang.statistics(:wall_clock) |> elem(0),
      memory: :erlang.memory()
    }

    req = :cowboy_req.reply(200,
      %{"content-type" => "application/json"},
      Jason.encode!(response),
      req
    )

    {:ok, req, state}
  end
end
