import React, { useState } from 'react'
import { createAppContainer, createSwitchNavigator} from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import {Image} from 'react-native'
import {FontAwesome5} from '@expo/vector-icons'

import Login from '../screens/Login'
import Feeds from '../screens/Feeds'
import AddPosts from '../screens/AddPost'
import AddCredit from '../screens/AddCredit'
import AddEvents from '../screens/AddEvent'
import Notification from '../screens/Notification'
import Profile from '../screens/Profile'
import currentUserProfile from '../screens/currentUserProfile'
import Settings from '../screens/Settings'
import Search from '../screens/Search'
import Add from '../screens/Add'
import Welcome from '../screens/Welcome'
import MessageList from '../screens/MessageList'
import MessageView from '../screens/MessageView'
import Messages from '../screens/Messages'
import Root from '../screens/index'
import Signup from '../screens/Signup'
import SinglePost from '../screens/SinglePost'
import EventDetails from '../screens/EventDetails'
import {createBottomTabNavigator} from 'react-navigation-tabs'

import CreateGroup from '../screens/RegisterEvent/CreateGroup'
import GroupSingle from '../screens/RegisterEvent/GroupSingle'
import MakePayment from '../screens/RegisterEvent/MakePayment'
import SelectGroup from '../screens/RegisterEvent/SelectGroup'
import CreateGroup1 from '../screens/RegisterEvent/CreateGroupForm1'
import OnlineStatus from '../components/Onlinetatus'

import GroupDetails from '../screens/Groups/ViewGroupDetails'
import GroupChat from '../screens/Groups/GroupChat'
import Announcement from '../screens/Groups/Announcement'
import GroupChatList from '../screens/Groups/GroupChatList'
import Comments from '../components/Coments'
import CostBreakDown from '../screens/Groups/CostBreatDown'
import TabIcon from '../components/TabIcon'


import {Alert} from 'react-native'
import firebase,{ auth } from '../config/firebaseCon'

const db = firebase.firestore()



import { theme } from '../constants'


const AddPostScreens = createStackNavigator({
    Add: {
        screen: Add,
        navigationOptions: {
            headerShown: false,
        }
    },
    addEvent: {
        screen: AddEvents,
    },
    addPost: {
        screen: AddPosts
    },
    addCredit:{
        screen: AddCredit
    },
    settings: {
        screen: Settings
    },
    singlePost:{
        screen: SinglePost
    },
    

},{
    defaultNavigationOptions: {
        headerShown:false

    }
        
})


const messagingNav = createStackNavigator({
    App: {
        screen: Feeds
    },
    message : {
        screen: MessageView,
    },
    chats: {
        screen: Messages
    },
    groupSingle: {
        screen: GroupSingle
    },
    makePayment: {
        screen: MakePayment
    },
    selectGroup: {
        screen: SelectGroup
    },
    createGroup: {
        screen: CreateGroup
    },
    eventDetails: {
        screen: EventDetails
    },
    groupForm_1: {
        screen: CreateGroup1
    },
    groupDetails:{
        screen: GroupDetails,
        path: 'groupDetails'
    },
    groupChat: {
        screen: GroupChat
    },
    costbreakdown: {
        screen: CostBreakDown
    },
    Profile: {
        screen: Profile,
        path:'profile'
    },
    groupList: {
        screen: GroupChatList
    },
    comments: {
        screen: Comments
    },
    onlineStatus: {
        screen: OnlineStatus
    },
    announcement:{
        screen: Announcement
    }
},{
    defaultNavigationOptions: {
        headerShown: false
    }
})

const tabNav = createBottomTabNavigator({
    Feeds:{
        screen: messagingNav,
        path: 'messaging',
        navigationOptions: {
            tabBarIcon: () => <FontAwesome5 name="home" size={24} color='black' />
        }
    },
    Notification:{
        screen: Notification,
        path: 'notification',
        navigationOptions: () => {

            return {
                tabBarIcon: ({focused}) => {
                    
                    return <TabIcon name="bell" size={24} color="black" />
            }
        }

    }  
    },
    Add: {
        screen: AddPostScreens,
        navigationOptions: () => {

            return{

                tabBarIcon: () => <FontAwesome5 name="plus-square" size={24} color='black' />
            }

        }
    },
    Search: {
        screen: Search,
        navigationOptions:{
            tabBarIcon: () => <FontAwesome5 name="search" size={24} color='black' />

        }
    },
    currentUserProfile: {
        screen: currentUserProfile,
        navigationOptions:{
            tabBarIcon: () => <FontAwesome5 name="user-circle" size={24} color='black' />

        }
    }

},{
    tabBarOptions: {
        showLabel: false
    },
    initialRouteName: "Feeds"
})


const StartPages = createStackNavigator({
    Welcome,
    Login,
    Signup,
    // Explore,
    // Products,
    // Settings,
   
},{
    defaultNavigationOptions: {
        headerShown: false,
       
    }
})


const screens = createSwitchNavigator({
    Auth: {
        screen: StartPages,
        path: 'auth'
    },
    Root: {
        screen: tabNav,
        path:'root'
    },
})


export default createAppContainer(screens)