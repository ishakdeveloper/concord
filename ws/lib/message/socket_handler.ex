defmodule Ws.Message.SocketHandler do
  @behaviour :cowboy_websocket

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
            # TODO: Add token verification logic here using the tokens
            # For now just storing tokens in state
            state = Map.merge(opts, %{
              access_token: access_token,
              refresh_token: refresh_token
            })
            {:cowboy_websocket, req, state}
          else
            {:ok, :cowboy_req.reply(401, req), opts}
          end
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
