/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {RNCamera} from 'react-native-camera';

import * as RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';

import {request, PERMISSION, PERMISSIONS} from 'react-native-permissions';
import {RNFFmpeg} from 'react-native-ffmpeg';

import ZoomView from './scripts/ZoomView';

const videoFiles = [];

const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: 'lightgreen',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Text>Waiting</Text>
  </View>
);

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recordOptions: {
        mute: false,
        maxDuration: 15,
        quality: RNCamera.Constants.VideoQuality['1080p'],
        // quality: RNCamera.Constants.VideoQuality['720p'],
        // path:"rnCameraTest",
      },
      isRecording: false,
      isPause: false,
      zoom: 0,
      autoFocus: {x: 0.5, y: 0.5, autoExposure:true},
    };
  }
  render() {
    return (
      <View style={styles.container}>
        <ZoomView
          onZoomProgress={progress => {
            console.log('zoom : ', progress);
            this.setState({zoom: progress});
          }}
          onZoomStart={() => {
            console.log('zoom start');
          }}
          onZoomEnd={focusCor => {
            focusCor.x = focusCor.x/this.state.cameraWidth;
            focusCor.y = focusCor.y/this.state.cameraHeight;
            console.log('zoom end : ', focusCor);
            this.setState({autoFocus: focusCor});
          }}>
          <RNCamera
            onLayout={event => {
              this.state.cameraWidth = event.nativeEvent.layout.width;
              this.state.cameraHeight = event.nativeEvent.layout.height;
              console.log(
                `width : ${event.nativeEvent.layout.width}, height: ${event.nativeEvent.layout.height}`,
              );
            }}
            ref={ref => {
              this.camera = ref;
            }}
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.on}
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: 'We need your permission to use your camera',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
            androidRecordAudioPermissionOptions={{
              title: 'Permission to use audio recording',
              message: 'We need your permission to use your audio',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
            zoom={this.state.zoom}
            autoFocus={RNCamera.Constants.AutoFocus.on}
            autoFocusPointOfInterest={this.state.autoFocus}
            flashMode={RNCamera.Constants.FlashMode.off}
            >
            <View style={styles.gridLine}>
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
            </View>
            <View style={styles.gridLine}>
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
            </View>
            <View style={styles.gridLine}>
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
            </View>
          </RNCamera>

          {/* child component 로 RNCamera 가 있을 시 제스쳐가 제대로 전달이 안되어서 투명한 뷰로 위를 덮어 씌움 */}
          {/* <View
            style={{
              position: 'absolute',
              flex: 1,
              width: 500,
              height: 500,
              backgroundColor: 'transparent',
            }}></View> */}
        </ZoomView>

        <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableOpacity onPress={this.takeVideo} style={styles.capture}>
            <Text style={{fontSize: 14}}>
              {' '}
              {!this.state.isRecording ? 'record' : 'stop'}{' '}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.merge} style={styles.capture}>
            <Text style={{fontSize: 14}}> merge </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  merge = async () => {
    // RNFFmpeg.execute('-i file1.mp4 -c:v mpeg4 file2.mp4').then(result => console.log("FFmpeg process exited with rc " + result.rc));

    // await RNFFmpeg.execute('-i "" -c copy output.mp4')

    console.log('video files:', videoFiles);

    try {
      //비디오가 있을 때
      if (videoFiles.length > 0) {
        // let executeString = `concat:${videoFiles[0]}`;
        let appendResult;
        //합치려는 파일들의 이름을 명시한 텍스트 파일이 필요
        let fileExist = await RNFS.exists(
          `${RNFS.DocumentDirectoryPath}/file.txt`,
        );
        // 만약 이미 해당 파일이 있다면 지우고 시작
        if (fileExist) {
          RNFS.unlink(`${RNFS.DocumentDirectoryPath}/file.txt`);
        }
        //찍어놓은 파일 이름들을 다 텍스트파일에 적기
        for (let n = 0; n < videoFiles.length; n++) {
          try {
            appendResult = await RNFS.appendFile(
              `${RNFS.DocumentDirectoryPath}/file.txt`,
              `file '${videoFiles[n]}'\n`,
            );
            console.log('append success:', appendResult);
          } catch (e) {
            console.log('append error:', e);
          }
        }

        let readFile = await RNFS.readFile(
          `${RNFS.DocumentDirectoryPath}/file.txt`,
        );
        console.log('readFile : ', readFile);

        console.log('append result :', appendResult);
        //-safe 0: 파일 이름이 unsafe 해도 상관 없음. 과 절대 경로를 사용, -y : 같은 이름의 파일이 있으면 overwrite, -n : 같은 이름의 파일이 있으면 그냥 종료
        let ffmepgExecution = `-f concat -safe 0 -i file://${RNFS.DocumentDirectoryPath}/file.txt -y -c copy ${RNFS.DocumentDirectoryPath}/output.mp4`;

        console.log('execute string:', ffmepgExecution);

        let ffmpegResult = await RNFFmpeg.execute(ffmepgExecution);

        console.log('ffmpeg result : ', ffmpegResult);

        //해당 파일을 갤러리에 저장
        CameraRoll.saveToCameraRoll(`${RNFS.DocumentDirectoryPath}/output.mp4`);

        // 가지고 있던 비디오 파일 리스트 초기화
        videoFiles.length = 0;
      } else {
        console.log('no video file');
      }
    } catch (e) {
      console.log('error : ', e);
    }
  };

  takePicture = async () => {
    if (this.camera) {
      const options = {quality: 0.5, base64: true};
      const data = await this.camera.takePictureAsync(options);
      console.log(data.uri);
    }
  };
  takeVideo = async () => {
    if (this.camera) {
      try {
        //ios 의 경우 plist 에 camera, microphone, photo library usage 추가해주어야 함.
        if (Platform.OS === 'android') {
          request(PERMISSIONS.ANDROID.CAMERA);
          request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
          request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
        }

        if (this.state.isRecording == true) {
          this.camera.stopRecording();
        } else {
          const promise = this.camera.recordAsync(this.state.recordOptions);
          console.log('promise : ', promise);
          if (promise) {
            this.setState({isRecording: true});
            const data = await promise;
            this.setState({isRecording: false});
            // console.warn('takeVideo', data);
            videoFiles.push(data.uri);
            try {
              // CameraRoll.saveToCameraRoll(data.uri);
            } catch (e) {
              console.log('save error:', e);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    // justifyContent: 'flex-end',
    // alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  gridLine: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 0.2,
    borderColor: 'white',
  },
});
