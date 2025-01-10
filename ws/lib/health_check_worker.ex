defmodule Ws.HealthCheckWorker do
  use GenServer
  require Logger

  def start_link(_) do
    GenServer.start_link(__MODULE__, %{})
  end

  def init(state) do
    schedule_health_check()
    {:ok, state}
  end

  def handle_info(:health_check, state) do
    perform_health_check()
    schedule_health_check()
    {:noreply, state}
  end

  defp schedule_health_check do
    # Run every 15 seconds
    Process.send_after(self(), :health_check, 15_000)
  end

  defp perform_health_check do
    port = Application.get_env(:ws, :port)
    url = "http://localhost:#{port}/health"

    case :httpc.request(:get, {String.to_charlist(url), []}, [], []) do
      {:ok, {{_, 200, _}, _, _}} ->
        Logger.debug("Health check passed")
      error ->
        Logger.warn("Health check failed: #{inspect(error)}")
    end
  end
end
