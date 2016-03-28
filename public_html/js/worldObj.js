
/* global Cesium */

function world() {

  this.setCameraLookingAt = function (site) {
    w.viewer.camera.flyTo(launchPadViews[site]);
  };

  var trackedStage = 0;
  this.trackEntity = function (stage) {
    if(w.viewer.trackedEntity !== w.entities[stage]) {
      w.trackedStage = stage;
      w.viewer.trackedEntity = w.entities[stage];
      w.viewer.camera.zoomOut();      
    }
  };
  
  this.getTrackedStage = function() {
    return w.trackedStage;
  };

  var w = this;
  var entities; // map of Cesium stage entities

  var props = {};
  this.setProps = function (p) {
    w.props = p;
  };
  this.setProp = function (name, value) {
    w.props[name] = value;
  };
  this.getProp = function (key) {
    if (w.props.hasOwnProperty(key)) {
      return w.props[key];
    }
    return undefined;
  };
  this.getProps = function() {
    return w.props;
  };

  var viewer;

  var launchPadViews = {};

  /*
   setInterval(function() {
   var heading = 180.0*viewer.camera.heading/Math.PI;
   var pitch = 180.0*viewer.camera.pitch/Math.PI;
   var roll = 180.0*viewer.camera.roll/Math.PI;
   var matrix = viewer.camera.inverseViewMatrix;
   var pos1 = Math.sqrt(matrix[12]*matrix[12]+matrix[13]*matrix[13]);
   var pos2 = matrix[14];
   var lat = 180.0*Math.atan(pos2/pos1)/Math.PI;
   var lon = 180.0*Math.atan(matrix[12]/matrix[13])/Math.PI;
   var radius = Math.sqrt(matrix[12]*matrix[12]+matrix[13]*matrix[13]+matrix[14]*matrix[14]);
   var height = radius - 6378137;
   var x = 1;
   }, 10000);  
   */

  launchPadViews['LC4E'] = {
    destination: Cesium.Cartesian3.fromDegrees(-128.654, 27.955, 772000.0),
    orientation: {
      heading: Cesium.Math.toRadians(67.776),
      pitch: Cesium.Math.toRadians(-36.982),
      roll: Cesium.Math.toRadians(359.873)
    }
  };
  launchPadViews['LC40'] = {
    destination: Cesium.Cartesian3.fromDegrees(-76.162, 19.863, 480000.0),
    orientation: {
      heading: Cesium.Math.toRadians(356.939),
      pitch: Cesium.Math.toRadians(-26.816),
      roll: Cesium.Math.toRadians(359.795)
    }
  };
  launchPadViews['BOCA'] = {
    destination: Cesium.Cartesian3.fromDegrees(-93.885, 15.088, 882000.0),
    orientation: {
      heading: Cesium.Math.toRadians(326.332),
      pitch: Cesium.Math.toRadians(-36.270),
      roll: Cesium.Math.toRadians(359.831)
    }
  };

};