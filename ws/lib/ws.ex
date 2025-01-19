defmodule Ws.Router do
  @moduledoc false
  import Plug.Conn
  use Plug.Router

  @type json :: String.t() | number | boolean | nil | [json] | %{String.t() => json}

  plug :match
  plug :dispatch

  get "/metrics" do
    conn
      |> Plug.Conn.put_resp_content_type("text/plain")
      |> Plug.Conn.send_resp(200, Prometheus.Format.Text.format())
  end

  get "/health" do
    send_resp(conn, 200, "ok")
  end

  options _ do
    send_resp(conn, 200, "")
  end

  match _ do
    send_resp(conn, 404, "Not Found")
  end
end
