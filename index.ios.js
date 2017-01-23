import React, { Component } from 'react'
import { Modal, AppRegistry, StyleSheet, StatusBar, Text, TouchableHighlight, View } from 'react-native'
import Svg, { Circle, Line, Path, Rect} from 'react-native-svg'
import Dimensions from 'Dimensions'

// TODO
import apartment from './apartment.js'
var floorplan = apartment.floorplan
var apartmentLights = apartment.lights

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

var setGroup = function(groupNumber, data) {
  return fetch('http://' + hue_internalipaddress + '/api/' + hue_username + '/groups/' + groupNumber + '/action', {
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
  state = {
    modalVisible: false,
    activeLight: -1,

    lightOn: {},
    lightHexOverride: {},
    lights: undefined
  }

  componentDidMount() {
    this.updateLightStates()
    this.periodicallyCheckLightStates()
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible })
  }

  updateLightStates() {
    getLights().then((lights) => {
      apartmentLights.map((light, i) => {
        this.state.lightOn[light.id] = lights[light.id].state.on
      })
      this.setState({ lightOn: this.state.lightOn })
      this.setState({ lights: lights })
      this.setState({ lightHexOverride: {} })
    })
  }

  periodicallyCheckLightStates() {
    setInterval(() => {
      this.updateLightStates()
    }, 20 * 1000)
  }

  setActiveLightColor(color, data) {
    if (this.state.activeLight === -1 || !this.state.lights) {
      return
    }

    if (this.state.activeLight === 'all') {
      setGroup(1, data)

      apartmentLights.map((light, i) => {
        this.state.lightOn[light.id] = true
        this.state.lightHexOverride[light.id] = color
      })

      this.setState({ lightOn: this.state.lightOn })
      this.setState({ lightHexOverride: this.state.lightHexOverride })

    } else {
      setLight(this.state.activeLight, data)

      this.state.lightOn[this.state.activeLight] = true
      this.setState({ lightOn: this.state.lightOn })

      this.state.lightHexOverride[this.state.activeLight] = color
      this.setState({ lightHexOverride: this.state.lightHexOverride })
    }
  }

  openLightModal(number) {
    return () => {
      if (this.state.modalVisible) {
        return
      }
      this.setState({ activeLight: number })
      this.setModalVisible(true)
    }
  }

  toggleLight(number) {
    return () => {
      if (!this.state.lightOn[number]) {
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

  render() {
    return (
      <TouchableHighlight style={styles.container} onLongPress={this.openLightModal('all')}>
        <View style={styles.container}>
          <Modal
            animationType={'slide'}
            transparent={true}
            visible={this.state.modalVisible}
          >
            <TouchableHighlight
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => {
                this.setModalVisible(!this.state.modalVisible)
              }}
            >
              <View style={{
                flex: 1,
                padding: 32,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
                }}>
                <View style={{
                  width: 256,
                  height: 128,
                  backgroundColor: 'red',
                  borderTopLeftRadius: 13,
                  borderTopRightRadius: 13,
                  borderBottomLeftRadius : 13,
                  borderBottomRightRadius: 13,
                }}>
                  <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}>
                    <View style={{
                      width: 256,
                      height: 64
                    }}>
                      <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                      }}>
                        <TouchableHighlight onPress={() => {
                          this.setActiveLightColor('#3b45fb', { on: true, bri: 200, hue: 47125, sat: 253 })
                          this.setModalVisible(!this.state.modalVisible)
                        }}>
                          <View style={{width: 64, height: 64, backgroundColor: '#3b45fb', borderTopLeftRadius: 13}}/>
                        </TouchableHighlight>
                        <TouchableHighlight onPress={() => {
                          this.setActiveLightColor('#fd70e7', { on: true, bri: 150, hue: 55236, sat: 253 })
                          this.setModalVisible(!this.state.modalVisible)
                        }}>
                          <View style={{width: 64, height: 64, backgroundColor: '#fd70e7'}} />
                        </TouchableHighlight>
                        <TouchableHighlight onPress={() => {
                          this.setActiveLightColor('#fc6125', { on: true, bri: 200, hue: 65427, sat: 253 })
                          this.setModalVisible(!this.state.modalVisible)
                        }}>
                          <View style={{width: 64, height: 64, backgroundColor: '#fc6125'}} />
                        </TouchableHighlight>
                        <TouchableHighlight onPress={() => {
                          this.setActiveLightColor('#fd9765', { on: true, bri: 250, hue: 2871, sat: 157 })
                          this.setModalVisible(!this.state.modalVisible)
                        }}>
                          <View style={{width: 64, height: 64, backgroundColor: '#fd9765', borderTopRightRadius: 13}}/>
                        </TouchableHighlight>
                      </View>
                    </View>
                    <View style={{
                      width: 256,
                      height: 64
                    }}>
                      <View style={{
                        flex: 1,
                        width: 256,
                        height: 64,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                      }}>
                        <TouchableHighlight onPress={() => {
                          this.setActiveLightColor('#fefbff', { on: true, bri: 254, hue: 34497, sat: 232, ct: 155 })
                          this.setModalVisible(!this.state.modalVisible)
                        }}>
                          <View style={{width: 64, height: 64, backgroundColor: '#fefbff', borderBottomLeftRadius: 13}}/>
                        </TouchableHighlight>
                        <TouchableHighlight onPress={() => {
                          this.setActiveLightColor('#fec475', { on: true, bri: 254, hue: 14704, sat: 155, ct: 382 })
                          this.setModalVisible(!this.state.modalVisible)
                        }}>
                          <View style={{width: 64, height: 64, backgroundColor: '#fec475'}} />
                        </TouchableHighlight>
                        <TouchableHighlight onPress={() => {
                          this.setActiveLightColor('#fdb052', { on: true, bri: 254, hue: 14704, sat: 155, ct: 494 })
                          this.setModalVisible(!this.state.modalVisible)
                        }}>
                          <View style={{width: 64, height: 64, backgroundColor: '#fdb052'}} />
                        </TouchableHighlight>
                        <TouchableHighlight onPress={() => {
                          this.setActiveLightColor('#222', { on: false })
                          this.setModalVisible(!this.state.modalVisible)
                        }}>
                          <View style={{width: 64, height: 64, backgroundColor: '#222', borderBottomRightRadius: 13}}/>
                        </TouchableHighlight>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableHighlight>
          </Modal>

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
            {apartmentLights.map(function(l, i) {
              return (
                <Circle
                  key={l.id}
                  title={l.title}
                  cx={l.cx}
                  cy={l.cy}
                  r={floorplan.lightHitTargetSize}
                  onPress={this.toggleLight(l.id)}
                  onLongPress={this.openLightModal(l.id)}
                  fill="rgba(0, 0, 0, .01)"
                  stroke="none" />
              )
            }, this)}
            {apartmentLights.map(function(l, i) {
              return (
                <Circle
                  key={l.id}
                  title={l.title}
                  cx={l.cx}
                  cy={l.cy}
                  r={floorplan.lightSize}
                  onPress={this.toggleLight(l.id)}
                  onLongPress={this.openLightModal(l.id)}
                  fill={(this.state.lightOn[l.id] && this.state.lights) ? (this.state.lightHexOverride[l.id] || lightStateToHex(this.state.lights[l.id].state)) : (this.state.lightOn[l.id] === false ? '#222' : 'rgba(0, 0, 0, 0)')}
                  stroke="none" />
              )
            }, this)}
          </Svg>
        </View>
      </TouchableHighlight>
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
