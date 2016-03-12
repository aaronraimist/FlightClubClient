

// Initialize map
var viewer = new Cesium.Viewer('cesiumContainer', {
	timeline: false,
	animation: false,
	scene3DOnly: true,
	fullscreenButton: false,
	homeButton: false,
	geocoder: false,
  baseLayerPicker: false
  
});

viewer.scene.globe.enableLighting = true;
var terrainProvider = new Cesium.CesiumTerrainProvider({
    url : '//assets.agi.com/stk-terrain/world',
    requestWaterMask: true,
    requestVertexNormals : true
});
viewer.terrainProvider = terrainProvider;
