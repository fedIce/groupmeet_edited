import React, {Component} from 'react'
import 
{ 
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Image
 } from "react-native";
import { Text, Block } from '../components'
import {connect} from 'react-redux'
import { theme } from '../constants';
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons'
import { compose } from 'redux'
import { firestoreConnect } from 'react-redux-firebase'

import * as utils from '../config/validate'
import * as action from '../constants/store/utils/actions'
import { CustomHeader } from '../components/header'
import moment from 'moment'


const timeLine =(date)=>{
    return (
        <View style={styles.timeLine}><Text caption style={styles.timeLineText}>{date}</Text></View>
    )
}


const newNotification =(newI, user, message, time )=>{

    if(this.props.userData){
        this.props.navigation.setParams(utils.extractUser(this.props.userData, user.uid))
    }

    return (
        <Block>
            
            <TouchableOpacity>
            <View style={styles.ProfileTabs}>
            {newI? <View style={{ backgroundColor: '#7ac15b', width: 5, alignSelf: 'stretch' , marginVertical: 10}}><Text></Text></View> : <View></View> }
                <View style={styles.icon}> 
                    <Image style={styles.avatar} source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcST5F7_lviwof-a8lFlKVx-WOv9xmU4XPoP1Q&usqp=CAU' }} />
                </View>
                <View style={{ flex: 6,  justifyContent: 'center', alignItems: 'stretch'}}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text bold color={ theme.colors.gray }>{user}</Text>
                        <Text style={{ color: '#464646', fontWeight: '200', fontSize: 12, marginHorizontal: 10}}>{time}</Text>
                    </View>
                    <Text  caption numberOfLines={1} style={{ color: '#000', marginRight:5}}>{message}</Text>
                </View>
            </View>
            </TouchableOpacity>
        </Block>
    )
}

 class Notification extends Component {
     

    recievedRequests = (user, reciever) => {
        return (
            <Block space="between">
                <Block style={styles.ProfileTabs}>
                    <Block style={styles.icon} style={{ maxWidth: 60, alignItems: 'center' }}>  
                        <Image style={styles.avatar} source={{ uri: user.data.avatar }} />
                    </Block>
                    <Block >
                        <Block middle padding={[0, theme.sizes.base ]} style={{ alignItems:'flex-start'}} >
                            <Text caption><Text bold color={ theme.colors.gray }>@{user.data.username}</Text>  has requested to follow you</Text>
                            <Text style={{ color: theme.colors.tertiary, fontWeight: '200', fontSize: 12 }}>Pending</Text>
                        </Block>
                    </Block>
                    <Block row padding={[0, theme.sizes.padding]} style={{ alignItems: 'center', maxWidth: 120, marginHorizontal: 10}}>
                        <TouchableOpacity onPress={() => this.props.acceptFollowRequest(user.data.senderUid, reciever)} style={styles.acceptRequest}>
                             <Feather name="check" size={14} color={theme.colors.white} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.cancelFollowRequest(user.data.senderUid, reciever)} style={styles.cancelRequest}>
                            <Feather name="x" size={14} color={theme.colors.white} />
                        </TouchableOpacity>
                    </Block>
                </Block>
            </Block>
        )
    }
    
     sentRequests = (user, sender) => {
        return (
            <Block space="between">
                <Block style={styles.ProfileTabs}>
                    <Block style={styles.icon} style={{ maxWidth: 60, alignItems: 'center' }}>  
                        <Image style={styles.avatar} source={{ uri: user.data.avatar }} />
                    </Block>
                    <Block middle padding={[0, theme.sizes.base ]} style={{ flex: 5, alignItems:'flex-start'}} >
                        <Text caption>You sent a follow request to<Text bold color={ theme.colors.gray }> @{user.data.username}</Text></Text>
                        <Text style={{ color: theme.colors.tertiary, fontWeight: '200', fontSize: 12 }}>Pending</Text>
                    </Block>
                    <Block padding={[0, theme.sizes.padding]} style={{ alignItems: 'flex-end'}}>
                        <TouchableOpacity onPress={() => this.props.cancelFollowRequest(sender, user.data.recieverUid)} style={styles.cancelRequest}>
                             <Feather name="x" size={14} color={theme.colors.white} />
                        </TouchableOpacity>
                    </Block>
                </Block>
            </Block>
        )
    }
    

    render(){
        const {height, width} = Dimensions.get('window')
        const { notification } = this.props
        var d = 0
        const {user} = this.props
        const userProfile = this.props.userData? utils.extractUser(this.props.userData, user.uid): null
        return (
                <Block style={styles.mainContainer}>
                    <CustomHeader navL='none' left={<Block style={{ justifyContent: 'flex-start', alignItems: 'center'}} row><Feather name="bell" size={24} /><Text title bold>  Notifications</Text></Block>} />
               <View style={styles.container}>
                   <ScrollView>
                       <Block>
                           
                       {
                           userProfile.requests.length > 0?
                           userProfile.requests.map(item => {

                            if(moment(item.data.date.toDate()).format('L') != d){
                                d = moment(item.data.date.toDate()).format('L')
                                return user.uid == item.data.recieverUid? ([timeLine(moment(item.data.date.toDate()).startOf('seconds').fromNow()), this.recievedRequests(item, user.uid)]) : ([timeLine(moment(item.data.date.toDate()).startOf('seconds').fromNow()), this.sentRequests(item, user.uid)])
                            }
                              return user.uid == item.data.recieverUid?
                                this.recievedRequests(item, user.uid)
                                :
                                this.sentRequests(item, user.uid) 
                           })
                           :
                           <Block center middle margin={[160, 0]}>
                               <Feather name="inbox" color={theme.colors.gray3}  size={40}/>
                               <Text caption color={theme.colors.gray2}>
                                   You have no Notifications
                               </Text>
                            </Block>
                       }
                     </Block>
                      {notification && notification.map( item => {
                          
                          if(item.date != d){
                            d=item.date 
                            return ([timeLine(item.date), newNotification(item.new,item.user, item.message, item.time)])
                          }
                          return newNotification(item.new,item.user, item.message, item.time)
                        }
                        )}
                   </ScrollView>
               </View>

           </Block>
        )
    }
 }

 const {width, height} = Dimensions.get('window')

 const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        width,
        height,
        alignItems:'stretch',
        justifyContent: 'space-between',
        marginVertical: 10,
        marginHorizontal: 0,

    },
    avatar:{
        width:48,
        height:48,
        borderRadius:24
    },
    container:{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        paddingHorizontal: 20
     },
     ProfileTabs:{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 76,
        backgroundColor: '#fff',
        marginBottom: 2
     },
     icon:{
        flex: 1, 
        marginStart: 5
        
     },
     timeLine:{
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10
     },
     timeLineText:{
         fontSize: 13,
         color: '#7f7f7f'
     },
     cancelRequest:{
        backgroundColor: theme.colors.accent,
        padding: 10,
        borderRadius: 30,
        marginEnd: 5
    },
    acceptRequest:{
        backgroundColor: theme.colors.primary,
        padding: 10,
        borderRadius: 30,
        marginEnd: 5

    }
 })

 const mapStateToProps = (state) =>{
    //  console.log(state.firestore.data.Users)
     return {
        notification: state.auth.notifications,
        user: state.firebase.auth,
        userData: state.firestore.data.Users,
     }

 }

const mapDispatchToProps = (dispatch) =>{
    return {
        fetchPosts: () => dispatch(action.fetchPosts()),
        fetchFeeds: () => dispatch(action.fetchFeeds()),
        followUser: (from, to) => dispatch(action.sendFollowRequest(from, to)),
        cancelFollowRequest: (sender, reciever) => dispatch(action.removeFollowRequest(sender, reciever)),
        acceptFollowRequest: (sender, reciever) => dispatch(action.acceptFollowRequest(sender, reciever))
    }
}

 export default compose(connect(mapStateToProps, mapDispatchToProps), firestoreConnect([
    {'collection': 'Users'}
]))(Notification)
 