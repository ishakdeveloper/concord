defmodule WSWeb.HealthController do
  use WSWeb, :controller

  def check(conn, _params) do
    json(conn, %{status: "healthy"})
  end
end
