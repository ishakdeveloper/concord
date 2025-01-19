defmodule Ws.Metrics do
  use Prometheus.Metric

  def setup do
    # Connection metrics
    Gauge.declare(
      name: :ws_active_connections,
      help: "Number of active WebSocket connections"
    )

    Counter.declare(
      name: :ws_connection_total,
      help: "Total number of WebSocket connections made"
    )

    Counter.declare(
      name: :ws_connection_errors_total,
      help: "Total number of WebSocket connection errors",
      labels: [:error_type]
    )

    # Token refresh metrics
    Counter.declare(
      name: :ws_token_refresh_total,
      help: "Total number of token refresh attempts"
    )

    Counter.declare(
      name: :ws_token_refresh_errors_total,
      help: "Total number of token refresh errors",
      labels: [:error_type]
    )

    Histogram.declare(
      name: :ws_token_refresh_duration_seconds,
      help: "Token refresh duration in seconds",
      buckets: [0.1, 0.25, 0.5, 1, 2.5, 5]
    )

    # Process metrics
    Gauge.declare(
      name: :ws_process_memory_bytes,
      help: "Memory used by WebSocket processes in bytes"
    )
  end

  # Helper functions to update metrics
  def connection_established do
    Counter.inc(name: :ws_connection_total)
    Gauge.inc(name: :ws_active_connections)
  end

  def connection_terminated do
    Gauge.dec(name: :ws_active_connections)
  end

  def connection_error(error_type) do
    Counter.inc(name: :ws_connection_errors_total, labels: [error_type])
  end

  def token_refresh_started do
    Counter.inc(name: :ws_token_refresh_total)
  end

  def token_refresh_error(error_type) do
    Counter.inc(name: :ws_token_refresh_errors_total, labels: [error_type])
  end

  def observe_token_refresh(duration_seconds) do
    Histogram.observe([name: :ws_token_refresh_duration_seconds], duration_seconds)
  end

  def update_process_metrics do
    memory = :erlang.memory()
    Gauge.set([name: :ws_process_memory_bytes], memory[:total])
  end
end
