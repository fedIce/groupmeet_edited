import React, { Component } from 'react'
import { Block, Text, Button } from '../components'
import { StyleSheet, View, TouchableOpacity, TextInput, Image, ScrollView, Modal, ActivityIndicator } from 'react-native'
import {  Feather } from '@expo/vector-icons'
import { theme } from '../constants'
import { connect } from 'react-redux'
import * as ImagePicker from 'expo-image-picker'
import firebase from '../config/firebaseCon'
const fb = require('firebase')
import * as Linking from 'expo-linking'
import * as IntentLauncher from 'expo-intent-launcher'
import Constants from "expo-constants";
import Event from '../config/Event'


const db = firebase.firestore()



class Settings extends Component {

    state = {
        fullNmae: '',
        displayName: '',
        phone: '',
        address: '',
        status: '',
        link: '',
        photoURL: '',
        isUploadingImage: false,
        updating: false,
        userInfo: null

    }

    updateUserNode =() => {
        db.collection('Users').doc(this.props.user.uid).update({
            avatar: this.state.photoURL,
            username:this.state.displayName,
            fullName: this.state.fullNmae,
            phone: this.state.phone,
            address: this.state.address,
            status: this.state.status,
            link: this.state.link,
        })
    }

    openSettings =() => {
        const pkg = Constants.manifest.releaseChannel
            ? Constants.manifest.android.package  // When published, considered as using standalone build
            : "host.exp.exponent"; // In expo client mode

        if(Platform.OS=='ios'){
            Linking.openURL('app-settings:')
          }
          else{
            IntentLauncher.startActivityAsync(
              IntentLauncher.ACTION_APP_NOTIFICATION_SETTINGS,{ data: 'package:' + pkg } 
            );
          }
    }

    LoadUserInfo = async () => {
        db.collection('Users').doc(this.props.user.uid).get()
        .then( querySnapshot => {
            this.setState({
                fullNmae: querySnapshot.data().fullName? querySnapshot.data().fullName: '',
                displayName: querySnapshot.data().username? querySnapshot.data().username: '',
                phone: querySnapshot.data().phone? querySnapshot.data().phone: '',
                address:querySnapshot.data().address? querySnapshot.data().address: '',
                status: querySnapshot.data().status? querySnapshot.data().status: '',
                link: querySnapshot.data().link? querySnapshot.data().link: '',
                photoURL: querySnapshot.data().avatar? querySnapshot.data().avatar: ''
            })
        }).catch(err => console.log(err))
    }

    componentDidMount(){
        const { user } = this.props

       this.LoadUserInfo()
    }

    _pickImage = async () => {
 
            try {
            

            const user = await fb.auth().currentUser
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.1,
                aspect: [4,3]
            });
            if (!result.cancelled) {
                this.setState({ isUploadingImage:  true })
                const photo = await this.uploadProfileImageAsync(result.uri)
                user.updateProfile({
                    photoURL: photo
                }).then(() => {
                    this.setState({
                        photoURL: photo
                    })
                }).then(() => {
                    this.updateUserNode()
                }).then(() => {
                    this.setState({ isUploadingImage:  false })
                }).catch(err => console.log(err))
            }
    
            } catch (E) {
                console.log(E);
            }
     }

    updateUser = async () => {
        this.setState({ updating:  true })
        const user = await fb.auth().currentUser

        user.updateProfile({
            fullName: this.state.fullNmae,
            displayName: this.state.displayName,
            phone: this.state.phone,
            address: this.state.address,
            status: this.state.status,
            link: this.state.link,
        }).then(() => {
            this.updateUserNode()
        }).then(() => {
            this.setState({ updating:  false })
        }).catch(err => console.log(err))
    }

    uploadProfileImageAsync = async (uri) => {
        const user = await fb.auth().currentUser
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function() {
              resolve(xhr.response);
            };
            xhr.onerror = function(e) {
              reject(new TypeError('Network request failed' , e ));
            };
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
          });
        
          const ref = fb
            .storage()
            .ref().child(`profile/${this.props.user.uid}`)
          const snapshot = await ref.put(blob);
        
          // We're done with the blob, close and release it
          blob.close();
               
         return await snapshot.ref.getDownloadURL()
          
    }



    logOutUser =async () => {
        fb.auth().signOut()
        this.props.navigation.navigate('Login')
        await Event.shared.changeOnlineStatus(false)
    }
    render(){
        const { navigation } = this.props
        const { user } = this.props
        return (
            <Block style={{backgroundColor: theme.colors.white}}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="chevron-left" size={24} color={theme.colors.gray}/></TouchableOpacity>
                    <TouchableOpacity onPress={() => this.updateUser()}><Feather name="check" size={24} color={theme.colors.gray}/></TouchableOpacity>
                </View>
                <View style={{ width: 100, margin: 20, alignSelf:'center' }}>
                    <Image source={{ uri: this.state.photoURL }} style={styles.avatar} progressiveRenderingEnabled={true}  />
                    <TouchableOpacity onPress={() => this._pickImage()} style={styles.newImageIcon}><Feather name="plus" size={15} /></TouchableOpacity>
                    
                    {
                        this.state.isUploadingImage?
                        <View style={{ backgroundColor: theme.colors.semiTransWhite, position: "absolute", width:'100%', height:'100%', alignItems:'center', justifyContent: 'center'}}>
                            <ActivityIndicator size="large" />
                        </View>
                        :null
                    }
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputTitle}>Full Name</Text>
                        <TextInput onChangeText={(val) => this.setState({ fullNmae: val })} value={this.state.fullNmae} style={styles.inputs} placeholder="John Doe" />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputTitle}>Mobile Phone</Text>
                        <TextInput value={this.state.phone} onChangeText={(val) => this.setState({ phone: val })} keyboardType="phone-pad" placeholder="+1 234 67879 67" style={styles.inputs}/>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputTitle}>Username</Text>
                        <TextInput value={this.state.displayName} onChangeText={(val) => this.setState({ displayName: val })} keyboardType="default" placeholder="JohnDoe123" style={styles.inputs}/>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputTitle}>Address</Text>
                        <TextInput value={this.state.address} onChangeText={(val) => this.setState({ address: val })} keyboardType="default" placeholder="1st Plant Avenue ..." style={styles.inputs}/>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputTitle}>Status</Text>
                        <TextInput value={this.state.status} onChangeText={(val) => this.setState({ status: val })} multiline={true} numberOfLines={3} maxLength={500} placeholder=" Say somethig interesting about yourself..." keyboardType="default" style={styles.inputs}/>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputTitle}>Link</Text>
                        <TextInput value={`${this.state.link} `} maxLength={300} onChangeText={(val) => this.setState({ link: val })} keyboardType="email-address" placeholder="example@mail.com" style={styles.inputs}/>
                    </View>
                    <View  style={styles.inputContainer}>
                        <TouchableOpacity onPress={() => this.openSettings()} style={{flexDirection:'row', justifyContent:'space-between', paddingHorizontal:20}}>
                            <Text>Notification Permission Settings</Text>
                            <Feather name="bell" size={24} color={theme.colors.gray2}/>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <Button style={{ marginHorizontal: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems:'center', justifyContent:'center', backgroundColor: theme.colors.accent}} onPress={() => this.logOutUser() }>
                    <Feather name="log-out" size={20} color={theme.colors.white} />
                    <Text white style={{paddingHorizontal: 10 }}>Logout</Text>
                </Button>
                <Modal
                        visible={this.state.updating}
                        transparent={true}
                    >
                        <Block center middle style={{ backgroundColor: theme.colors.semiTransWhite}}>
                            <ActivityIndicator size="large" />
                        </Block>
                    </Modal>
            </Block>
        )
    }
}

const styles = StyleSheet.create({
    header:{
        height: 90,
        width: '100%',
        backgroundColor: theme.colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 30,
        marginBottom: 10,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,
        elevation: 15
    },
    avatar:{
        width: 100,
        height: 100,
        borderRadius: 50
    },
    newImageIcon:{
        width:30,
        height: 30,
        backgroundColor: theme.colors.white,
        justifyContent:'center',
        alignItems: 'center',
        borderRadius: 20,
        position:'absolute',
        bottom: 1,
        right: 1,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,
        elevation: 15
    },
    inputs:{
        width: '100%',
        borderBottomColor: theme.colors.gray3,
        paddingHorizontal: 10,
        paddingVertical:5,
        borderBottomWidth: 1
    },
    inputTitle:{
        color: theme.colors.gray3,
        fontSize: 12
    },
    inputContainer:{
        marginHorizontal: 20,
        marginVertical: 20
    }

})


const mapStateToProps = (state) => {
    return {
        user: state.firebase.auth,
    }
}

export default connect(mapStateToProps, null)(Settings)