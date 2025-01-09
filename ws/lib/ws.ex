defmodule Ws.Router do
  @moduledoc false
  import Plug.Conn
  use Plug.Router

  @type json :: String.t() | number | boolean | nil | [json] | %{String.t() => json}

  plug :match
  plug :dispatch

  options _ do
    send_resp(conn, 200, "")
  end

  match _ do
    send_resp(conn, 404, "Not Found")
  end
end
