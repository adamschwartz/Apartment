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

var calculateFloorplanScaler = function() {
  var scale = 1
  var padding = 30 // TODO

  var widthRatio = floorplan.width / (deviceWidth - (padding * 2))
  var heightRatio = floorplan.height / (deviceHeight - (padding * 2))

  if (widthRatio > heightRatio) {
    scale = 1 / widthRatio
  } else {
    scale = 1 / heightRatio
  }

  return scale
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
      lightOn: {}
    }

    this.initializeLightsState()
  }

  initializeLightsState() {
    getLights().then((responseJson) => {
      lights.map((light, i) => {
        this.state.lightOn[light.id] = responseJson[light.id].state.on
        this.setState({ lightOn: this.state.lightOn })
      })
    })
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
                stroke="#333"
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
                fill="rgba(0, 0, 0, .02)"
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
                fill={this.state.lightOn[l.id] ? '#ffd696' : (this.state.lightOn[l.id] === false ? '#444' : 'rgba(0, 0, 0, 0)')}
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
