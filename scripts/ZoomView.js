import React, {Component} from 'react';
import {
  View,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';

// ZoomView
export default class ZoomView extends Component {
  constructor(props) {
    super(props);
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      

      onPanResponderMove: (e, {dy}) => {
        const {height: windowHeight} = Dimensions.get('window');
        console.log('asdfasdf');
        return this.props.onZoomProgress(
          Math.min(Math.max((dy * -1) / windowHeight, 0), 1),
        );
      },
      onMoveShouldSetPanResponder: (ev, {dx}) => {
        console.log("12312341234")
        return dx !== 0;
      },
      onPanResponderGrant: () => {
        return this.props.onZoomStart();
      },
      onPanResponderRelease: () => {
        return this.props.onZoomEnd();
      },
    });
  }  

  render() {
    return (
      <View
        style={{flex: 1, width: '100%',backgroundColor:"green"}}
        {...this._panResponder.panHandlers}>
        {this.props.children}
      </View>
    );
  }
}
