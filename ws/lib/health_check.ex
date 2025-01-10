defmodule Ws.HealthCheck do
  @behaviour :cowboy_handler

  def init(req, state) do
    {wall_clock, _} = :erlang.statistics(:wall_clock)
    memory = :erlang.memory()

    response = %{
      status: "healthy",
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      uptime_ms: wall_clock,
      memory: %{
        total: memory[:total],
        processes: memory[:processes],
        system: memory[:system],
        atom: memory[:atom],
        binary: memory[:binary]
      }
    }

    req = :cowboy_req.reply(200,
      %{"content-type" => "application/json"},
      Jason.encode!(response),
      req
    )

    {:ok, req, state}
  end
end
