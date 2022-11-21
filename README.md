## A web map built with React and the ArcGIS JS API, and consuming ArcGIS Online resources

### Objectives

- Display the different layers related with income information in Spain, 2020.
- Allow the user to examine all different layers without exiting the application.
- When users switch to a different layer, the view extent shall be maintained.
- When users switch to a different layer, don't re-render the basemap layer.

- #### Setup from scratch

  - Use create-react-app to initialize a React app with NPM in the current folder
    > > npx create-react-app .
  - Esri Calcite Icons: https://github.com/Esri/calcite-components-examples/tree/master/react
    - Install Esri Calcite UI Icons https://esri.github.io/calcite-ui-icons/
      > > npm install @esri/calcite-ui-icons
    - Install the 'ncp' Node package, and add the 'postinstall' and 'copy' scripts to 'package.json'
    - Install Esri Calcite Components React
      This package includes the compatible version of the main component library as a dependency, so no need to install @esri/calcite-components separately.
      > > npm install @esri/calcite-components-react
    - Install the Calcite assets locally (this will copy the Calcite assets (the icons, basically) from "node_packages/@esri/calcite-components/dist/calcite/assets" into "public/assets")
      > > npm run copy

- #### Todo

  - Implement English

- #### Notes
  - Use only ES modules (ESM) via CDN for testing and prototyping, as it is not optimized for fast loading. Instead, build the ES modules locally (via NPM, which what we are doing) or use AMD modules via the ArcGIS CDN.
  - React samples at https://github.com/Esri/jsapi-resources
  - YT video at https://www.youtube.com/watch?v=0fJmKSWURyU
