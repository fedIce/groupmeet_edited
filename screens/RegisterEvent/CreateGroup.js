import React, { Component } from 'react'
import { Block, Text, Button } from '../../components'
import firebase from 'firebase'
import  {CustomHeader } from '../../components/header'
import { Ionicons, Feather } from '@expo/vector-icons'
import { theme } from '../../constants'
import { StyleSheet, TextInput, View, Picker, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native'
import Tags from "react-native-tags";
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment'
import Event from '../../config/Event'
import { ScrollView } from 'react-native-gesture-handler'

var tagx = []

class CreateGroup extends Component {

    state = {
        dateMode: 'date',
        endDateMode: 'date',
        showStartDate: false,
        showEndDate: false,
        loading: false,
        startDate: new Date() ,
        endDate: new Date(), 

        groupName: '',
        maxCap: 0,
        groupDesc: '',
        openStatus: '',
        registrationOpen: ''

    }

   
    addTag = (tags)=>{
        tagx = tags
   }

   setShowStart =(value)=>{
        this.setState({ showStartDate: value })
    }


    setMode =(value)=>{
        this.setState({ dateMode: value })
    }
 

    showMode =(value)=>{
        this.setState({ dateMode: value })
    }

   

    setStartDate =(value)=>{
        this.setState({ startDate: value })
    }


    onStartChange = (event, selectedDate) => {
        const currentDate = selectedDate || startDate;
        this.setShowStart(Platform.OS === 'ios');
        this.setStartDate( currentDate );
        this.closingStatus()
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


    toggleLoading =(value) => {
        this.setState({ loading: value })
    }

    nextPage = () => {
        const post = this.props.navigation.state.params.prop.prop.post
        const {user} = this.props.navigation.state.params.prop.prop

        this.setState({ loading:true })

        Event.shared.createGroup({
            eventId: post.pid,
            groupName: this.state.groupName,
            maxCap: this.state.maxCap,
            desc: this.state.groupDesc,
            requirements: tagx ,
            closeReg: this.state.startDate,
            status: this.state.registrationOpen,
            user: user.uid,
            avatar: user.photoURL,
            name: user.displayName,
            eventChargingMethod: post.data.group.groupChargingMethod,
            eventPrice: post.data.ticketPrice,
            openSlots: post.data.numberOfRegistrations? parseInt(post.data.numberOfRegistrations) - parseInt(this.state.maxCap) : parseInt(post.data.maxCapacity) - parseInt(this.state.maxCap)
        }).then(res => {
            this.setState({loading: false})
            this.props.navigation.navigate('groupForm_1', { from: 'groupForm_1' , eventPrice: post.data.ticketPrice, groupId: res, prop: this.props.navigation.state.params.prop.prop })
        })

       
    }

    groupMaxCap = (val, maxcap) => {

        if(parseInt(val) > parseInt(maxcap) && parseInt(maxcap) != 0){
            Alert.alert("Max Capacity Exceeded", `Maximum capacity must be less that the allowed event capacity (${maxcap})`)
            this.setState({ maxCap: parseInt(maxcap) })
        }else{

            this.setState({ maxCap: val })
        }
    }

    closingStatus =() => {
        const post = this.props.navigation.state.params.prop.prop.post.data
        const eventDate = post.eventDates[1]
        const today = new Date()


        const diffTime = Math.abs(new Date(eventDate) - this.state.startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        // console.log(diffTime + " milliseconds");
        // console.log(diffDays + " days");

        if(today < this.state.startDate){
            console.log("Upcoming in "+ diffDays+ " Days")
            if(diffDays <= 7){
                this.setState({ registrationOpen: false })
                Alert.alert("NOTICE"," Events Registration Must Close At Least 7 Days Before Event Closing Dates ")
            }else{
                this.setState({ registrationOpen: true  })
            }
        }
        if(today == this.state.startDate){
            console.log("Today")
            this.setState({ registrationOpen: true  })
        }

        if(today > this.state.startDate){
            console.log("Closed since "+ diffDays+ " Days ")
            this.setState({ registrationOpen: true  })
        }
    }

    render(){
        const post = this.props.navigation.state.params.prop.prop.post.data
        const {pid} = this.props.navigation.state.params.prop.prop.post
        const {user} = this.props.navigation.state.params.prop.prop
        return (
            <Block style={{ backgroundColor: theme.colors.white}}>
                 <CustomHeader left={
                    <Ionicons name="md-arrow-back" size={24} color={theme.colors.gray2}/>
                } 
                navL={this.props.navigation}
                />
               <Block padding={[0, theme.sizes.padding]}>
                    <Block>
                    <ScrollView>
                        <View style={styles.inputBox}>
                            <Text>Group Name</Text>
                            <TextInput placeholder="My Awesome Event" onChangeText={(val) => this.setState({ groupName: val })} style={styles.inputs}/>
                        </View>
                        <View style={styles.inputBox}>
                            <Text>Group Max Capacity</Text>
                            <TextInput placeholder="0" onChangeText={(val) => this.groupMaxCap(val, post.maxCapacity)} style={styles.inputs} keyboardType="number-pad"/>
                            <Text caption color={theme.colors.gray} style={styles.inputCaption}> Maximun number of people allowed to join this group ( 0 = maximum ) </Text>
                        </View>
                        <View style={styles.inputBox}>
                            <Text>Group Description</Text>
                            <TextInput placeholder="say something about this group, lay out particpation rules and guides" onChangeText={(val) => this.setState({ groupDesc: val })} style={styles.inputs} multiline={true} numberOfLines={6} maxLength={500} />
                            <Text caption color={theme.colors.gray} style={styles.inputCaption}> Message for group participants (max 500) </Text>
                        </View>
                        <View style={styles.inputBox}>
                            <Text  color={theme.colors.black} style={{ marginHorizontal: 10, marginVertical: 10, marginTop: 20 }}>Requirements: <Text caption bold gray style={{ fontSize: 12 }}> ( ( runningShoes , bicycle, .., etc. ), click on an item to delete it ) </Text></Text>
                            <Tags
                                textInputProps={{
                                    placeholder: "#BoatCruise"
                                }}
                                initialTags={[]}
                                onChangeTags={tags => this.addTag(tags)}
                                onTagPress={(index, tagLabel, event, deleted) => null
                                    // console.log(index, tagLabel, event, deleted ? "deleted" : "not deleted")
                                }
                                containerStyle={{ justifyContent: "center" }}
                                inputStyle={{ fontSize: 10 }}
                                renderTag={({ tag, index, onPress, deleteTagOnPress, readonly }) => (
                                    <TouchableOpacity key={`${tag}-${index}`} onPress={onPress}>
                                    <Text caption bold color={theme.colors.gray}> #{tag} </Text>
                                    </TouchableOpacity>
                                )}
                                />
                            </View>
                            <View style={styles.inputBox}>
                                <Text>When does registration for this group close</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                    {/* <Text style={{ marginHorizontal: 18 }}>Closing Time</Text> */}
                                    <Button style={styles.TimeBtn} onPress={this.showDatepickerStart} ><Text bold color={theme.colors.white}>{moment(this.state.startDate).format('MMMM Do YYYY')}</Text></Button>
                                    <Button style={styles.TimeBtn} onPress={this.showTimepickerStart}><Text bold color={theme.colors.white}>{moment(this.state.startDate).format('h:mm a')}</Text></Button>
                            </View>

                             <View style={[styles.inputBox, { marginTop: 40}]}>
                                    <Button gradient onPress={() => this.nextPage()}><Text center bold white>Next</Text></Button>
                            </View>
                               
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

                            </View>
                        </ScrollView>
                    </Block>
               </Block>
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

const styles = StyleSheet.create({
    inputs:{
        width: '100%',
        paddingHorizontal: 20, 
        paddingVertical: 5,
        borderBottomColor: theme.colors.gray2,
        borderBottomWidth:2,
        
    },
    inputBox: {
        marginTop: 20
    },
    inputCaption:{
        paddingTop: 5
    },
    TimeBtn:{
        paddingVertical: 5,
        paddingHorizontal: 20,
        backgroundColor: theme.colors.secondary,
        marginHorizontal: 10,
        borderRadius: 30
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

export default CreateGroup