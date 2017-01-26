import React, { Component } from 'react'
import { Animated, AppRegistry, Easing, TouchableHighlight, View } from 'react-native'

export default class Light extends Component {
  constructor(props) {
    super(props)

    this.state = {
      scale: new Animated.Value(1)
    }

    this.lastOnPressIn = undefined
    this.lastOn = undefined
  }

  onPressIn() {
    this.lastOnPressIn = + new Date
  }

  componentDidUpdate() {
    if (this.lastOn === this.props.on) {
      return
    } else {
      if (this.lastOn === undefined) {
        this.lastOn = this.props.on
        return
      }

      this.lastOn = this.props.on
    }

    now = + new Date
    // UI should easilly respond in half a second
    if (now - this.lastOnPressIn < 500) {
      return
    }

    if (!this.props.on) {
      return
    }

    this.runAttentionAnimation()
  }

  runAttentionAnimation() {
    this.state.scale.setValue(1)
    Animated.sequence([
      Animated.timing(this.state.scale, {
        toValue: 1.4,
        duration: 150,
        easing: Easing.easeOut
      }),
      Animated.spring(this.state.scale, {
        toValue: 1,
        friction: 2
      })
    ]).start()
  }

  render() {
    // TODO look into `TouchableHighlight` `hitSlop` instead of using two circlular views
    return (
      <View pointerEvents='box-none' style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }}>
        <Animated.View pointerEvents='box-none' style={{
          position: 'absolute',
          left: this.props.cx - this.props.radius,
          top: this.props.cy - this.props.radius,
          width: this.props.radius * 2,
          height: this.props.radius * 2,
          borderRadius: this.props.radius,
          backgroundColor: this.props.color,
          transform: [{scale: this.state.scale}]
        }}/>

        <TouchableHighlight
          underlayColor='rgba(0, 0, 0, 0)'
          onPress={this.props.onPress}
          onLongPress={this.props.onLongPress}
          delayPressIn={0}
          onPressIn={() => this.onPressIn()}
          style={{
            position: 'absolute',
            left: this.props.cx - this.props.pressRadius,
            top: this.props.cy - this.props.pressRadius,
            borderRadius: this.props.pressRadius
          }}>
          <View
            style={{
              width: this.props.pressRadius * 2,
              height: this.props.pressRadius * 2,
              borderRadius: this.props.pressRadius
            }}/>
        </TouchableHighlight>
      </View>
    )
  }
}

AppRegistry.registerComponent('Light', () => Light)
