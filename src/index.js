import React from "react"
import ReactDOM from "react-dom/client"

import App from "./App"
import "./index.css"

import { setAssetPath } from "@esri/calcite-components/dist/components"
// Local assets
setAssetPath(window.location.href)

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
)
