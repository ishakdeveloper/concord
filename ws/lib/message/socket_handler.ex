defmodule Ws.Message.SocketHandler do
  def init(req, opts) do
    {:ok, req, opts}
  end

  def websocket_init(state) do
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
