import React, { Component } from 'react'
import { Modal, AppRegistry, StyleSheet, StatusBar, Text, TouchableHighlight, View } from 'react-native'
import Svg, { Circle, Line, Path, Rect} from 'react-native-svg'
import Dimensions from 'Dimensions'

import Light from './light.js'
import Colors from './colors.js'
import ApartmentData from './apartment-data.js'
import HUE from './hue.js'

StatusBar.setHidden(true, false)

const floorplan = ApartmentData.floorplan
const apartmentLights = ApartmentData.lights

const deviceHeight = Dimensions.get('window').height
const deviceWidth = Dimensions.get('window').width

const calculateFloorplanScaler = function(floorplan) {
  let scale = 1
  const padding = 50 // TODO

  const widthRatio = floorplan.width / (deviceWidth - (padding * 2))
  const heightRatio = floorplan.height / (deviceHeight - (padding * 2))

  if (widthRatio > heightRatio) {
    scale = 1 / widthRatio
  } else {
    scale = 1 / heightRatio
  }

  return Math.max(1, scale)
}

const floorplanScale = calculateFloorplanScaler(ApartmentData.floorplan)

const lightStateToHex = function(lightState) {
  return '#' + Colors.CIE1931ToHex(lightState.xy[0], lightState.xy[1], lightState.bri)
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#000'
  }
})

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
    HUE.getLights().then((lights) => {
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
    }, 5 * 1000) // TODO - use decay based on last touch event
  }

  setActiveLightColor(color, data) {
    if (this.state.activeLight === -1 || !this.state.lights) {
      return
    }

    if (this.state.activeLight === 'all') {
      HUE.setGroup(1, data)

      apartmentLights.map((light, i) => {
        this.state.lightOn[light.id] = true
        this.state.lightHexOverride[light.id] = color
      })

      this.setState({ lightOn: this.state.lightOn })
      this.setState({ lightHexOverride: this.state.lightHexOverride })

    } else {
      HUE.setLight(this.state.activeLight, data)

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
        HUE.setLight(number, { on: true })
        this.state.lightOn[number] = true
        this.setState({ lightOn: this.state.lightOn })
      } else {
        HUE.setLight(number, { on: false })
        this.state.lightOn[number] = false
        this.setState({ lightOn: this.state.lightOn })
      }
    }
  }

  render() {
    // TODO - show animation on open?
    // http://stackoverflow.com/a/35183518
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

          <View style={{
            position: 'absolute',
            left: (deviceWidth - floorplan.width) / 2,
            top: (deviceHeight - floorplan.height) / 2,
            width: floorplan.width,
            height: floorplan.height,
            transform:[{scale:floorplanScale}]
          }}>

            <Svg height={floorplan.height} width={floorplan.width}>
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
                    fill="none"
                  />
                )
              }, this)}
            </Svg>

            {apartmentLights.map(function(light) {
              return (
                <Light
                  key={light.id}
                  cx={light.cx}
                  cy={light.cy}
                  radius={floorplan.lightRadius}
                  pressRadius={floorplan.pressRadius}
                  on={this.state.lightOn[light.id]}
                  color={(this.state.lightOn[light.id] && this.state.lights) ? (this.state.lightHexOverride[light.id] || lightStateToHex(this.state.lights[light.id].state)) : (this.state.lightOn[light.id] === false ? '#222' : 'rgba(0, 0, 0, 0)')}
                  onPress={this.toggleLight(light.id)}
                  onLongPress={this.openLightModal(light.id)}
                />
              )
            }, this)}
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

AppRegistry.registerComponent('Apartment', () => Apartment)
