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
    this.touchNum = 0;
    this._panResponder = PanResponder.create({      
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      

      onPanResponderMove: (e, {dy}) => {
        this.touchNum = e.nativeEvent.touches.length;
        console.log("this is native event : ", e.nativeEvent)
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
      onPanResponderRelease: (e, gestureState) => {
        let focusCor = {x:0.5, y:0.5}
        if(this.touchNum == 1){
          focusCor = {x:gestureState.x0, y:gestureState.y0}
        }
        return this.props.onZoomEnd(focusCor);
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
