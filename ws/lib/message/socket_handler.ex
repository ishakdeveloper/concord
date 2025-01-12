defmodule Ws.Message.SocketHandler do
  @behaviour :cowboy_websocket

  def init(req, opts) do
    # Check origin header against configured CORS origin
    case :cowboy_req.header("origin", req) do
      # If origin header exists, validate it
      origin when is_binary(origin) ->
        cors_origin = Application.get_env(:ws, :cors_origin)
        if origin == cors_origin do
          {:cowboy_websocket, req, opts}
        else
          {:ok, :cowboy_req.reply(403, req), opts}
        end
      # If no origin header, allow the connection (for local development)
      :undefined ->
        {:cowboy_websocket, req, opts}
      # Reject any other cases
      _ ->
        {:ok, :cowboy_req.reply(403, req), opts}
    end
  end

  def websocket_init(state) do
    IO.puts("WebSocket initialized")
    {:ok, state}
  end

  def websocket_handle({:text, "ping"}, state) do
    {:reply, {:text, "pong"}, state}
  end

  def websocket_handle({:ping, _}, state) do
    {:reply, {:pong, ""}, state}
  end

  def websocket_info(info, state) do
    {:reply, {:text, info}, state}
  end

  def websocket_terminate(reason, _state, _req) do
    :ok
  end
end
