## A web app built with React and the ArcGIS JS API, consuming an ArcGIS tile server and REST map services.

---

![React badge](/assets/badges/React-20232A.svg "React") ![HTML5 badge](/assets/badges/HTML5-E34F26.svg "HTML5") ![CSS3 badge](/assets/badges/CSS3-1572B6.svg "CSS3") ![Javascript badge](/assets/badges/JavaScript-F7DF1E.svg "Javascript")

### Objectives

- Display the different layers related with income information in Spain, 2020.
- Allow the user to examine all different layers without exiting the application.
- When users switch to a different layer, the view extent shall be maintained.
- When users switch to a different layer, don't re-render the basemap layer.

#### Setup from scratch

- Use create-react-app to initialize a React app with NPM.
  ```
  npx create-react-app
  ```
- Esri Calcite Icons: <https://github.com/Esri/calcite-components-examples/tree/master/react>

  - Install Esri Calcite UI Icons <https://esri.github.io/calcite-ui-icons>
    ```
    npm install @esri/calcite-ui-icons
    ```
  - Install the _ncp_ Node package, and add the _postinstall_ and _copy_ scripts to 'package.json'
  - Install Esri Calcite Components React
    This package includes the compatible version of the main component library as a dependency, so no need to install _@esri/calcite-components_ separately.
    ```
    npm install @esri/calcite-components-react
    ```
  - Install the Calcite assets locally (this will copy the Calcite assets (the icons, basically) from "node_packages/@esri/calcite-components/dist/calcite/assets" into "public/assets")
    ```
    npm run copy
    ```
  - Install Toastify
    ```
    npm install react-toastify
    ```

- #### Todo

  ☞ Change cursor tipe when layer can be queried at that zoom level  
  ☞ Implement English  
  ☞ Implement debouncing for click events  
  ☞ Alerts about zooming in in order to query, plus the possibility of clicking on a different location without closing the info table  
  ☞ Animate the red little border while waiting for the map to appear, or the info widget to display info

- #### Notes

  - React samples at https://github.com/Esri/jsapi-resources
  - YT video at https://www.youtube.com/watch?v=0fJmKSWURyU

---
