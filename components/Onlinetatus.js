//This is an example code for AppState//
import React, { Component } from 'react';
//import react in our code.
import { AppState, View } from 'react-native';
import Event from '../config/Event'
import firebase,{ auth } from "../config/firebaseCon";
//import all the components we are going to use.


const toggleOnlineStatus = (lastSeen) => {
  firebase.firestore().collection("Users").doc(auth.currentUser.uid).update({
    last_seen: lastSeen
  })
}
export default class OnlineStatus extends Component {
  state = {
    appState: AppState.currentState,
  };


  componentDidMount() {
    
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = async nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
        await Event.shared.changeOnlineStatus(true)
        // this.toggleOnlineStatus("online")
        console.log('App has come to the foreground!');
    }else{
        // toggleOnlineStatus(new Date())
        await Event.shared.changeOnlineStatus(false)
    }
    console.log(nextAppState);
   
    this.setState({ appState: nextAppState });
  };

  render() {
    return (
     <View>

     </View>
    );
  }
}