import React, { Component } from 'react'
import { Block, Text, Button, Card, Input } from '../components'
import { CustomHeader } from '../components/header'
import {StyleSheet, Slider, Picker, View, CheckBox, Image, ActivityIndicator, Modal, Alert } from 'react-native'
import { theme } from '../constants'
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment'
import { Feather } from '@expo/vector-icons'
import { ScrollView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker'
import Event from '../config/Event'
import * as validate from '../config/validate'
import firebase from 'firebase'
import {connect} from 'react-redux'
 
const getUid = firebase.auth().currentUser? firebase.auth().currentUser.uid: null

class AddEvents extends Component {
    state ={ 
        value: 0,
        currentPosition: 0,
        discountPercentage: 0,
        groupChargeMethod: 0,
        eventType:'none',
        allowGroups: false,
        eventTitle: '',
        description: '',
        location: 0,
        startDate: new Date() ,
        endDate: new Date() ,

        dateMode: 'date',
        endDateMode: 'date',
        showStartDate: false,
        showEndDate: false,

        coverPhoto: '',
        loading: false,
        price: 0.00

    }

    resetValues =() => {
        this.setState({
            eventTitle: '',
            allowGroups:false,
            endDate: new Date(),
            startDate: new Date(),
            description: '',
            coverPhoto: '',
            location: 0,
            eventType: 0,
            value: 0,
            price: 0.00
        })
    }


    _pickImage = async () => {
        try {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
            aspect: [5, 3]
        });
        if (!result.cancelled) {
            this.setState({ coverPhoto:  result.uri  });
        }

        } catch (E) {
            console.log(E);
        }
    }
      

   getPhotoPermissions = async () =>{
       
            const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL)

                if(status != 'granted'){
                    Alert.alert("App needs your permission to accrss your Gallery")
                }else{
                    
                }
        
   }

//    checkEndTime = (value) => {
//     // const diffTime = Math.abs(new Date(this.state.startDate) - value);
//     // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

   



//    }


    setShowStart =(value)=>{
        this.setState({ showStartDate: value })
    }

    setShowEnd = (value)=>{
        this.setState({ showEndDate: value })
    }

    setMode =(value)=>{
        this.setState({ dateMode: value })
    }
    setEndMode =(value)=>{
        this.setState({ endDateMode: value })
    }
    
    showMode =(value)=>{
        this.setState({ dateMode: value })
    }

    showEndMode =(value)=>{
        this.setState({ endDateMode: value })
    }

    setStartDate =(value)=>{

        if(new Date() > value){
            Alert.alert("Uhmm, Start Date Error Brah!","Your events must start some time in the future")
            this.setState({ endDate: new Date() })
            return
        }

        this.setState({ startDate: value })
    }

    setEndDate =(value)=>{

        if(this.state.startDate > value){
            Alert.alert("Nah, You're Doing It Wrong!","End dates must be a time after start dates")
            this.setState({ endDate: this.state.startDate })
            return
        }
       

        this.setState({ endDate: value })
    }

    onStartChange = (event, selectedDate) => {
        const currentDate = selectedDate || startDate;
        this.setShowStart(Platform.OS === 'ios');
        this.setStartDate( currentDate );
      };

      onEndChange = (event, selectedDate) => {
        const currentDate = selectedDate || startDate;
        this.setShowEnd(Platform.OS === 'ios');
        this.setEndDate( currentDate );
      };
    
      showMode = currentMode => {
        this.setShowStart(true);
        this.setMode(currentMode);
      };
      showEndMode = currentMode => {
        this.setShowEnd(true);
        this.setEndMode(currentMode);
      };
    
      showDatepickerStart = () => {
        this.showMode('date');
      };
    
      showTimepickerStart = () => {
        this.showMode('time');
      };

      showDatepickerEnd = () => {
        this.showEndMode('date');
      };
    
      showTimepickerEnd = () => {
        this.showEndMode('time');
      };

      toggleLoading =(value) => {
          this.setState({ loading: value })
      }

      _createEvent = () => {

        if(this.state.coverPhoto != ''){
            this.toggleLoading(true)
            const data = {
                title: this.state.eventTitle,
                group: this.state.allowGroups? 
                {
                    // groupId: validate.generateUUID(), 
                    groupId:[], 
                    groupChargingMethod: this.state.groupChargeMethod == 2? this.state.discountPercentage : this.state.groupChargeMethod,
                    members: 
                    {
                        admin: getUid, 
                        regulars: []
                    }
                } 
                    
                    : null,
                maxCapacity: this.state.value,
                eventDates:  [this.state.endDate.toString(), this.state.startDate.toString()],
                description:  this.state.description,
                coverImage: this.state.coverPhoto,
                location: this.state.location,
                eventType: this.state.eventType,
                userId: getUid,
                username: this.props.user.displayName ,
                avatar: this.props.user.photoURL,
                registered: 0,
                price: this.state.price,
                eventCategory: this.state.eventType
            }

           
                Event.shared.createEvent(data)
                .then(res => {
                    this.toggleLoading(false)
                    this.resetValues()
                }).catch(err => {
                    console.log("---- : ",err)
                    this.toggleLoading(false)
                })
            }
      }

    render(){
        return (
            <Block>
                <CustomHeader 
                navL={this.props.navigation} 
                left={<Feather name="arrow-left"  size={24} color={theme.colors.gray} />} 
               />
                <View  style={styles.container}>
                    <ScrollView>
                            <Text title center >CREATE EVENT </Text>
                            <Text  center caption color={theme.colors.gray}>Create something beautiful</Text>

                            <Block>
                            <View style={styles.formItem}>
                                <Input onChangeText={(text) => {this.setState({eventTitle: text})}} style={styles.inputs} label={<Text style={styles.inputLabel}>Event Title</Text>}/>
                            </View>
                            
                            <View  style={styles.formItem}>
                                <Input placeholder="0" onChangeText={(text) => {this.setState({value: text})}} keyboardType="numeric" style={styles.inputs} label={<Text style={styles.inputLabel}> Max Capacity For Event </Text>}/>
                               
                                <Text caption style={{ alignSelf: 'flex-end', color: theme.colors.gray}}>Value: {this.state.value}    (<Text caption bold color={theme.colors.gray}> 0 = unlimited capacity</Text>)</Text>
                            </View>

                            <View style={styles.formItem}>
                                <Input onChangeText={(text) => {this.setState({price: text})}} keyboardType="numeric" style={styles.inputs} label={<Text style={styles.inputLabel}> Ticket Price </Text>}/>
                            </View>
                            
                            <View style={[styles.formItem,{ flexDirection: 'row', justifyContent: 'space-between'}]}>
                                <Text>Allow Groups</Text>
                                <CheckBox
                                    value={this.state.allowGroups}
                                    onValueChange={() => this.setState({allowGroups: !this.state.allowGroups})}
                                /> 
                            </View>
                            {
                                this.state.allowGroups? 
                                    <View style={styles.formItem}>
                                        <Text>How will groups be charged</Text>
                                        <Picker
                                        selectedValue={this.state.groupChargeMethod}
                                        onValueChange={(itemValue, itemIndex) => this.setState({groupChargeMethod: itemValue})}>
                                            <Picker.Item label="Full ticket price for each member" value="FullPrice"/>
                                            <Picker.Item label="Ticket price split equally amongst members" value="SplitEqually" />
                                            <Picker.Item label="Ticket price reduce by X% for each added member" value={2} />
                                        </Picker>
                                        {
                                            this.state.groupChargeMethod == 2?
                                            <View>
                                                <Input onChangeText={(text) => {this.setState({discountPercentage: text})}} inputType="numeric" style={styles.inputs} label={<Text style={styles.inputLabel}>Percentage (%)</Text>}/>
                                            </View>
                                            : null
                                        }
                                    </View>
                                :
                                null
                            }
                            <View style={styles.formItem}>
                                <Text>Event Category</Text>
                                <Picker
                                selectedValue={this.state.eventType}
                                onValueChange={(itemValue, itemIndex) => this.setState({eventType: itemValue})}>
                                    <Picker.Item label="Party" value={'Party'}/>
                                    <Picker.Item label="Adventure" value={'Adventure'} />
                                    <Picker.Item label="Weekends" value={'Weekends'} />
                                    <Picker.Item label="Games" value={'Games'} />
                                    <Picker.Item label="Sports" value={'Sports'} />
                                    <Picker.Item label="Tech" value={'Tech'} />
                                    <Picker.Item label="Midnight" value={'Midnight'} />
                                    <Picker.Item label="Music" value={'Music'} />
                                </Picker>
                            </View>

                                <View style={styles.formItem}>
                                    <Text>When will this event take place?</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                        <Text style={{ marginHorizontal: 18 }}>Start Time</Text>
                                        <Button style={styles.TimeBtn} onPress={this.showDatepickerStart} ><Text>{moment(this.state.startDate).format('MMMM Do YYYY')}</Text></Button>
                                        <Button style={styles.TimeBtn} onPress={this.showTimepickerStart}><Text>{moment(this.state.startDate).format('h:mm a')}</Text></Button>
                                    </View>
                                    <View  style={[styles.formItem, { flexDirection: 'row',alignItems: 'center', justifyContent: 'center'}]}>
                                        <Text style={{ marginHorizontal: 20 }}>End Time</Text>
                                        <Button style={styles.TimeBtn} onPress={this.showDatepickerEnd} ><Text>{moment(this.state.endDate).format('MMMM Do YYYY')}</Text></Button>
                                        <Button style={styles.TimeBtn} onPress={this.showTimepickerEnd}><Text>{moment(this.state.endDate).format('h:mm a')}</Text></Button>
                                    </View>
                                    <View style={styles.formItem}>
                                        {this.state.showStartDate && (
                                            <DateTimePicker
                                            testID="dateTimePicker"
                                            value={this.state.startDate}
                                            mode={this.state.dateMode}
                                            is24Hour={true}
                                            display="default"
                                            onChange={this.onStartChange}
                                            />
                                        )}

                                        {this.state.showEndDate && (
                                            <DateTimePicker
                                            testID="dateTimePicker"
                                            value={this.state.endDate}
                                            mode={this.state.endDateMode}
                                            is24Hour={true}
                                            display="default"
                                            onChange={this.onEndChange}
                                            />
                                        )}
                                    </View>
                                    <View style={styles.formItem}>
                                        <Text>Where will this event take place?</Text>
                                        <Picker
                                        selectedValue={this.state.location}
                                        onValueChange={(itemValue, itemIndex) => this.setState({location: itemValue})}>
                                            <Picker.Item label="Online" value={0}/>
                                            <Picker.Item label="To be annonced" value={2} />
                                        </Picker>
                                    </View>
                                </View>

                                <View style={styles.formItem}>
                                    <Input onChangeText={(text) => {this.setState({description: text})}} maxLength={1000} style={styles.multiForm} label={<Text>Talk a little about your event</Text>} multiline numberOfLines={4}/>
                                </View>

                                <View style={[styles.formItem,{ alignItems: 'center', justifyContent: 'center'}]}>
                                        <Button 
                                            onPress={this._pickImage}
                                            style={{ 
                                            flexDirection: 'row' ,
                                             justifyContent: 'center', 
                                             alignItems: 'center',
                                             borderColor: theme.colors.gray,
                                             borderWidth: 1,
                                             width: '100%'
                                             }}>
                                            <Feather name="image" style={{ marginHorizontal: 5}} size={15} />
                                            <Text>Add Cover Image</Text>
                                        </Button>
                                             {
                                                 this.state.coverPhoto !== ''?
                                                <View>
                                                    <Image resizeMode="contain" source={{ uri: this.state.coverPhoto}} style={styles.coverPhoto} />
                                                </View>
                                                : null
                                             }
                                </View> 
                                <View style={[styles.formItem,{ alignItems: 'center', justifyContent: 'center'}]}>
                                        <Button 
                                        gradient
                                        onPress={() => {this._createEvent()}}
                                        style={{ 
                                            flexDirection: 'row' ,
                                             justifyContent: 'center', 
                                             alignItems: 'center',
                                             borderColor: theme.colors.gray,
                                             borderWidth: 1,
                                             width: '100%',
                                             
                                             }}>
                                            <Text title color={theme.colors.white}>Create Event</Text>
                                            <Feather name="check-circle" style={{color: theme.colors.white, marginHorizontal: 15}} size={15} />
                                        </Button>
                                </View>

                            </Block>
                    </ScrollView>
                </View>
                <Modal
                    animationType="fade"
                    presentationStyle="overFullScreen"
                    transparent={true}
                    visible={this.state.loading}
                >
                    <Block center flex={1} style={styles.loadingModal}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </Block>
                </Modal>
            </Block>
        )
    }
}

const styles =  StyleSheet.create({
    container:{
        flex: 1,
        paddingHorizontal: 10,
        marginTop: 10,
        paddingTop: 20,
        backgroundColor: theme.colors.white
    },
    inputs:{
        borderRadius: 30,
        marginVertical:10,
        paddingHorizontal: 20,
        height: 40
    },
    inputLabel:{
        paddingLeft: 20
    },
    TimeBtn:{
        borderWidth: 1,
        borderColor: theme.colors.gray,
        paddingHorizontal: 20,
        marginHorizontal: 5
    },
    formItem:{
        marginVertical: 10
    },
    multiForm:{
        height: undefined,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginVertical: 10
    },
    coverPhoto: {
       width: '100%',
       height: undefined,
       aspectRatio: 2
    },
    loadingModal:{
        flex:1,
        alignItems: 'center',
        justifyContent:'center',
        width: '100%',
        height:'100%',
        backgroundColor:'rgba(255,255,255, .8)' 
    }
})

const mapStateToProps =(state) => {
    return {
        user: state.firebase.auth
    }
}

export default connect(mapStateToProps, null)(AddEvents)