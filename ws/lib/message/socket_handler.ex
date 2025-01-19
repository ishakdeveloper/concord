defmodule Ws.Message.SocketHandler do
  @behaviour :cowboy_websocket
  alias Ws.Metrics

  # Add refresh interval matching frontend
  @token_refresh_interval 15 * 60 * 1000 # 15 minutes in milliseconds

  def init(req, opts) do
    # Check origin header against configured CORS origin
    case :cowboy_req.header("origin", req) do
      # If origin header exists, validate it
      origin when is_binary(origin) ->
        cors_origin = Application.get_env(:ws, :cors_origin)
        if origin == cors_origin do
          # Get access and refresh tokens from cookies
          cookies = :cowboy_req.parse_cookies(req)
          access_token = :proplists.get_value("id", cookies, nil)  # id cookie contains access token
          refresh_token = :proplists.get_value("rid", cookies, nil) # rid cookie contains refresh token

          # Validate both tokens exist
          if access_token && refresh_token do
            Metrics.connection_established()
            # Store tokens in state
            state = Map.merge(opts, %{
              access_token: access_token,
              refresh_token: refresh_token,
              last_refresh: System.system_time(:millisecond)
            })
            {:cowboy_websocket, req, state}
          else
            Metrics.connection_error(:missing_tokens)
            {:ok, :cowboy_req.reply(401, req), opts}
          end
        else
          Metrics.connection_error(:invalid_origin)
          {:ok, :cowboy_req.reply(403, req), opts}
        end
      # If no origin header, allow the connection (for local development)
      :undefined ->
        {:cowboy_websocket, req, opts}
      # Reject any other cases
      _ ->
        Metrics.connection_error(:missing_origin)
        {:ok, :cowboy_req.reply(403, req), opts}
    end
  end

  def websocket_init(state) do
    # Schedule first token refresh
    schedule_token_refresh()
    {:ok, state}
  end

  # Handle token refresh timer
  def handle_info(:refresh_token, state) do
    current_time = System.system_time(:millisecond)

    if current_time - state.last_refresh >= @token_refresh_interval do
      # Call your token refresh API endpoint
      case refresh_tokens(state.refresh_token) do
        {:ok, new_tokens} ->
          # Schedule next refresh
          schedule_token_refresh()
          {:ok, %{state |
            access_token: new_tokens.access_token,
            refresh_token: new_tokens.refresh_token,
            last_refresh: current_time
          }}
        {:error, _reason} ->
          # Token refresh failed - close connection
          {:stop, :normal, state}
      end
    else
      # Not time to refresh yet
      schedule_token_refresh()
      {:ok, state}
    end
  end

  defp schedule_token_refresh do
    Process.send_after(self(), :refresh_token, @token_refresh_interval)
  end

  defp refresh_tokens(refresh_token) do
    start_time = System.monotonic_time(:millisecond)
    Metrics.token_refresh_started()

    try do
      case do_refresh_tokens(refresh_token) do
        {:ok, tokens} = result ->
          duration = (System.monotonic_time(:millisecond) - start_time) / 1000
          Metrics.observe_token_refresh(duration)
          result
        {:error, reason} = error ->
          Metrics.token_refresh_error(reason)
          error
      end
    rescue
      e ->
        Metrics.token_refresh_error(:unexpected_error)
        {:error, :unexpected_error}
    end
  end

  defp do_refresh_tokens(refresh_token) do
    api_url = Application.get_env(:ws, :api_url)
    headers = [
      {"Content-Type", "application/json"},
      {"Cookie", "rid=#{refresh_token}"}
    ]

    # tRPC expects a POST request with a specific format
    body = Jason.encode!(%{
      json: nil  # No input params needed for refresh
    })

    case HTTPoison.post("#{api_url}/trpc/auth.refresh", body, headers) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        case Jason.decode(body) do
          {:ok, %{"result" => %{"data" => tokens}}} ->
            {:ok, %{
              access_token: tokens["accessToken"],
              refresh_token: tokens["refreshToken"]
            }}
          _ ->
            {:error, :invalid_response}
        end
      {:ok, %HTTPoison.Response{status_code: status}} ->
        {:error, {:http_error, status}}
      {:error, %HTTPoison.Error{reason: reason}} ->
        {:error, {:network_error, reason}}
    end
  end

  def websocket_handle({:text, "ping"}, state), do: {:reply, {:text, "pong"}, state}
  def websocket_handle({:ping, _}, state), do: {:reply, {:pong, ""}, state}
  def websocket_info(info, state), do: {:reply, {:text, info}, state}
  def websocket_terminate(reason, _state, _req) do
    Metrics.connection_terminated()
    :ok
  end

  # Periodic process metrics update
  def handle_info(:update_metrics, state) do
    Metrics.update_process_metrics()
    schedule_metrics_update()
    {:ok, state}
  end

  defp schedule_metrics_update do
    Process.send_after(self(), :update_metrics, 60_000) # Every minute
  end
end
