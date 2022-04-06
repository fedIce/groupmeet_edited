if(__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'))
}


import React from 'react';
import 'react-native-get-random-values';
import { StyleSheet, Text, View } from 'react-native';
import firebase, {auth} from './config/firebaseCon'
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

import { AppLoading, Asset } from 'expo'
import store from './constants/store/store'
import { Provider } from 'react-redux'
import Event from './config/Event'
import Store from './config/Storage'
import { NavigationContainer } from '@react-navigation/native'

import {
  ReactReduxFirebaseProvider,
} from 'react-redux-firebase'

import { createFirestoreInstance } from 'redux-firestore';

import Navigation from './navigations'
import { Block } from './components';
import {decode, encode} from 'base-64'
import OnlineStatus from './components/Onlinetatus'
import * as Analytics from 'expo-firebase-analytics';
import {AsyncStorage, TouchableOpacity} from 'react-native'
import { theme } from './constants';
import {Feather} from '@expo/vector-icons'


if (!global.btoa) {  global.btoa = encode }

if (!global.atob) { global.atob = decode }


const images = [
  require('./assets/images/icons/back.png'),
  require('./assets/images/icons/plants.png'),
  require('./assets/images/icons/seeds.png'),
  require('./assets/images/icons/flowers.png'),
  require('./assets/images/icons/pots.png'),
  require('./assets/images/icons/fertilizers.png'),
  require('./assets/images/icons/sprayers.png'),
  require('./assets/images/plants_1.png'),
  require('./assets/images/plants_2.png'),
  require('./assets/images/plants_3.png'),
  require('./assets/images/explore_1.png'),
  require('./assets/images/explore_2.png'),
  require('./assets/images/explore_3.png'),
  require('./assets/images/explore_4.png'),
  require('./assets/images/explore_5.png'),
  require('./assets/images/explore_6.png'),
  require('./assets/images/avatar.png'),
];


const prefix =  Linking.makeUrl('/')
const db = firebase.firestore()
let unsubscribe = null

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


function createFnCounter(fn, invokeBeforeExecution) {
  let count = 0;
  return (snapshot) => {

    count++;
    if (count <= invokeBeforeExecution) {
      return null;
    } 

    return fn(snapshot, count);    
  }
}


function handleActivitySubscription(snapshot, counter) {
  const initialLoad = counter === 1;
  
  snapshot.docChanges().forEach( async function(change) {   
      if (initialLoad) {

            change.doc.data().data.map( async data => {
             
              if(auth.currentUser.uid == data.receiver ){
                AsyncStorage.setItem("NewMsg",JSON.stringify([{newMsg:true}]))

                await Store.store._updateChatList({
                  last_message: data.msg,
                  senderId: data.sender,
                  senderName: data.name,
                  senderAvatar: data.avatar,
                  time: data.time,
                  count: 1,
                  initial:true
                })
              }
            })    
        
            
      } else {

        change.doc.data().data.map( async data => {

          

        if(auth.currentUser.uid == data.receiver){
          
          AsyncStorage.setItem("NewMsg",JSON.stringify([{newMsg:true}]))
          Store.store.chatLogExists(data.sender).then(res => {

            console.log("Stats In App: ", res)

             Store.store._updateChatList({
                last_message: data.msg,
                senderId: data.sender,
                senderName: data.name,
                senderAvatar: data.avatar,
                time: data.time,
                count: 1,
                initial: res? false: true 
              })

          })
            }
        })       
      }      
    });
}

const handleActivitySubscriptionWithCounter = 
createFnCounter(handleActivitySubscription, 0);




var notificationListener = React.createRef();
var responseListener  = React.createRef();
var navRef  = React.createRef();


export default class App extends React.Component {


  constructor(props){
    super(props);


  }

  linking = {
    prefixes: [prefix],
    config:{
      screens:{
        Root:{
          screens:{
            Notification: 'notification'
          }
        },
        Auth:{

        }
      },
    }
  }

  state = {
    isLoadingComplete : false,
    pushToken: null,
    notification:null,
    initial: false
  }

  _handleUrl = url => {
    this.setState({ url });
    console.log("PARSE URL",JSON.stringify(url))
    if(typeof url == 'string'){
      url= url
    }else{
      url = url.url
    }

    let { path, queryParams } = Linking.parse(url);

  }

  UNSAFE_componentWillMount(){

     

      Analytics.setAnalyticsCollectionEnabled(true)
      Analytics.setCurrentScreen('App')

      this.registerForPushNotificationsAsync().then(token => this.setState({pushToken: token}, () => 
      Event.shared.storeUserPushNotificationId(token)));


    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      this.setState({notification});
      const badgeCount = Notifications.getBadgeCountAsync()
      badgeCount.then(count => {

      })
    });
   

    Linking.getInitialURL().then((ev) => {
      if (ev) {
        // console.log(JSON.stringify(ev))
        this._handleUrl(ev);
      }
    }).catch(err => {
        console.warn('An error occurred', err);
    });
    Linking.addEventListener(this._handleUrl);

    unsubscribe = db.collection('MessageUpdates').onSnapshot(handleActivitySubscriptionWithCounter);
    
  }

  UNSAFE_componentWillUnmount(){
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
    unsubscribe
  }


   registerForPushNotificationsAsync = async () => {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Allow Notifications for GroupMeet to recieve notifications');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;

      // await sendLocalPushNotificationAsync({ token, title: 'Welcome', body: 'Hey there, it\'s nice having you at GroupMeet' })

      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      
    }
  
    return token;
  }

  handleResourcesAsync = async () => {

    //cache all images for faster performance
    const cacheImages = images.map(img => {
      return Asset.fromModule(image).downloadAsync();
    });

    return Promise.all(cacheImages);
  }

  async _loadAssetsAsync() {
    const fontAssets = cacheFonts([
        {RobotoExtraBold: require('./assets/fonts/Roboto-Black.ttf')},
        {RobotoBold: require('./assets/fonts/Roboto-Bold.ttf')},
        {RobotoMedium: require('./assets/fonts/Roboto-Medium.ttf')},
        {RobotoRegular: require('./assets/fonts/Roboto-Regular.ttf')},
        {RobotoLight: require('./assets/fonts/Roboto-Light.ttf')}
    ]);

    await Promise.all([...fontAssets]);
}

  render(){

    // Reactotron.log('hello rendering world')

    const rrfConfig = {
      userProfile: 'users'
      // useFirestoreForProfile: true // Firestore for Profile instead of Realtime DB
    }

    const rrfProps = {
      firebase,
      config: rrfConfig,
      dispatch: store.dispatch
      // createFirestoreInstance // <- needed if using firestore
    }

    if(this.state.isLoadingComplete && this.props.skipLoadingScreen){
      return (
        <AppLoading 
        startAsync={[this.handleResourcesAsync, this._loadAssetsAsync ]}
        onError={error => console.warn(error)}
        onFinish={() => this.setState({ isLoadingComplete: true })}
        />
      )

    }

    return (
      <NavigationContainer linking={this.linking}  >
        <Provider store={store}>
          <ReactReduxFirebaseProvider  {...rrfProps} createFirestoreInstance={createFirestoreInstance}>
              <Block>
                    <Navigation ref={navRef} navigation={this.state.isLoadingComplete} />
                    <OnlineStatus/>
                    {
                      this.state.notification && this.state.notification.request.content.title == 'GroupMeet - New Message'?
                     <TouchableOpacity style={{ flexDirection:'row', justifyContent:'center', alignItems:'center', position:'absolute', top:30, backgroundColor: theme.colors.semiTransBlack, borderRadius:15, paddingHorizontal:10, height: 30, right:20 }} onPress={() =>  this.setState({notification: null})}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight:'bold' }}>{`${this.state.notification.request.content.data.senderName}: ${this.state.notification.request.content.data.message.split(':')[1].length > 20? this.state.notification.request.content.data.message.split(':')[1].slice(0, 20)+'...' : this.state.notification.request.content.data.message.split(':')[1]}`}</Text>
                        <Feather name='x' size={15} color={theme.colors.gray2}/>
                      </TouchableOpacity>
                      :
                      null
                    }
              </Block>
            </ReactReduxFirebaseProvider>
        </Provider>
     </NavigationContainer>
    );
  }

  
}



const styles = StyleSheet.create({
});
