
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
    destination: Cesium.Cartesian3.fromDegrees(-94.706, 15.725, 1108500.0),
    orientation: {
      heading: Cesium.Math.toRadians(355.6),
      pitch: Cesium.Math.toRadians(-43.032),
      roll: Cesium.Math.toRadians(359.8)
    }
  };
  launchPadViews['BOWT'] = {
    destination: Cesium.Cartesian3.fromDegrees(-103.824, 21.348, 450395.0),
    orientation: {
      heading: Cesium.Math.toRadians(357.51),
      pitch: Cesium.Math.toRadians(-21.66),
      roll: Cesium.Math.toRadians(359.93)
    }
  };

};