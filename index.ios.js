import React, { Component } from 'react'
import { AppRegistry, StyleSheet, StatusBar, Text, TouchableHighlight, View } from 'react-native'
import Svg, { Circle, Line, Path, Rect} from 'react-native-svg'
import Dimensions from 'Dimensions'

// TODO
import apartment from './apartment.js'
var floorplan = apartment.floorplan
var lights = apartment.lights

var deviceHeight = Dimensions.get('window').height
var deviceWidth = Dimensions.get('window').width

var lightStateToHex = function(lightState) {
  return xyBriToHex(lightState.xy[0], lightState.xy[1], lightState.bri)
}

// TODO
// use https://github.com/bjohnso5/hue-hacking/blob/master/src/colors.js for colors

// http://stackoverflow.com/questions/22894498/philips-hue-convert-xy-from-api-to-hex-or-rgb
var xyBriToHex = function(x, y, bri) {
  var z = 1.0 - x - y
  var Y = bri / 255.0 // Brightness of lamp
  var X = (Y / y) * x
  var Z = (Y / y) * z
  var r = X * 1.612 - Y * 0.203 - Z * 0.302
  var g = -X * 0.509 + Y * 1.412 + Z * 0.066
  var b = X * 0.026 - Y * 0.072 + Z * 0.962
  r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055
  g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055
  b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055
  var maxValue = Math.max(r, g, b)
  r /= maxValue
  g /= maxValue
  b /= maxValue
  r = r * 255
  if (r < 0) { r = 255 }
  g = g * 255
  if (g < 0) { g = 255 }
  b = b * 255
  if (b < 0) { b = 255 }
  r = Math.round(r).toString(16)
  g = Math.round(g).toString(16)
  b = Math.round(b).toString(16)
  if (r.length < 2) { r = '0' + r }
  if (g.length < 2) { g = '0' + g }
  if (b.length < 2) { b = '0' + b }
  return '#' + r + g + b
}

// // https://developers.meethue.com/content/rgb-hue-color0-65535-javascript-language
// var rgbToXY = function (red, green, blue) {
//   //Gamma correctie
//   red = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
//   green = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
//   blue = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92);

//   //Apply wide gamut conversion D65
//   var X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
//   var Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
//   var Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;

//   var fx = X / (X + Y + Z);
//   var fy = Y / (X + Y + Z);
//   if (isnan(fx)) {
//     //fx = 0.0f;
//   }
//   if (isnan(fy)) {
//     //fy = 0.0f;
//   }

//   return [fx.toPrecision(4),fy.toPrecision(4)];
// }

var calculateFloorplanScaler = function() {
  var scale = 1
  var padding = 50 // TODO

  var widthRatio = floorplan.width / (deviceWidth - (padding * 2))
  var heightRatio = floorplan.height / (deviceHeight - (padding * 2))

  if (widthRatio > heightRatio) {
    scale = 1 / widthRatio
  } else {
    scale = 1 / heightRatio
  }

  return Math.max(1, scale)
}

var floorplanScale = calculateFloorplanScaler()

StatusBar.setHidden(true, false)

// TODO
var hue_username = 'Zhbo-QPHAradDdtdc-4tYfjiUfvaIZYZ5yFBWDXQ'
var hue_internalipaddress = '10.0.0.206'

var getLights = function() {
  return fetch('http://' + hue_internalipaddress + '/api/' + hue_username + '/lights', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
}

var setLight = function(lightNumber, data) {
  return fetch('http://' + hue_internalipaddress + '/api/' + hue_username + '/lights/' + lightNumber + '/state', {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
}

export default class Apartment extends Component {
  constructor(props) {
    super(props)

    this.state = {
      lightOn: {},
      lights: {}
    }

    this.updateLightStates()
    this.periodicallyCheckLightStates()
  }

  updateLightStates() {
    getLights().then((lightsData) => {
      console.log(lightsData)

      lights.map((light, i) => {
        this.state.lightOn[light.id] = lightsData[light.id].state.on
      })
      this.setState({ lightOn: this.state.lightOn })
      this.setState({ lightsData: lightsData })
    })
  }

  periodicallyCheckLightStates() {
    setInterval(() => {
      this.updateLightStates()
    }, 20 * 1000)
  }

  toggleLight(number) {
    return () => {
      if (!this.state.lightOn[number]) {
        // TODO - use once we have long press to change color
        // setLight(number, { on: true, bri: 200, hue: 11079 })
        setLight(number, { on: true })
        this.state.lightOn[number] = true
        this.setState({ lightOn: this.state.lightOn })
      } else {
        setLight(number, { on: false })
        this.state.lightOn[number] = false
        this.setState({ lightOn: this.state.lightOn })
      }
    }
  }

  // TODO - use `onLongPress` touch events for light svg circles
  render() {
    // `key`s below needed or react complains with:
    // "Warning: Each child in an array or iterator should have a unique "key" prop."
    return (
      <View style={styles.container}>
        <Svg height={floorplan.height} width={floorplan.width} style={{transform:[{scale:floorplanScale}]}}>
          {floorplan.boxes.map(function(b, i) {
            return (
              <Rect
                key={b.id}
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                strokeWidth={floorplan.wallWidth}
                stroke="#222"
                fill="none" />
            )
          }, this)}
          {lights.map(function(l, i) {
            return (
              <Circle
                key={l.id}
                title={l.title}
                cx={l.cx}
                cy={l.cy}
                r={floorplan.lightHitTargetSize}
                onPress={this.toggleLight(l.id)}
                fill="rgba(0, 0, 0, .01)"
                stroke="none" />
            )
          }, this)}
          {lights.map(function(l, i) {
            return (
              <Circle
                key={l.id}
                title={l.title}
                cx={l.cx}
                cy={l.cy}
                r={floorplan.lightSize}
                onPress={this.toggleLight(l.id)}
                fill={(this.state.lightOn[l.id] && this.state.lightsData) ? lightStateToHex(this.state.lightsData[l.id].state) : (this.state.lightOn[l.id] === false ? '#222' : 'rgba(0, 0, 0, 0)')}
                stroke="none" />
            )
          }, this)}
        </Svg>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  }
})

AppRegistry.registerComponent('Apartment', () => Apartment)
