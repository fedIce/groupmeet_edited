import React, { Component } from 'react'
import { Block, Text, Button } from '../components'
import { theme } from '../constants'
import {Image} from 'react-native'
import {Tabs, Tab} from '../components/Tabs'
import { StyleSheet } from 'react-native'
import { CustomHeader } from '../components/header'
import { TouchableOpacity } from 'react-native-gesture-handler'
import MessageList from './MessageList'
import GroupChatList from './Groups/GroupChatList'
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons'


class MessageView extends Component {
    state ={
        activeTab: 0
    }

    componentDidMount(){
        if(this.props.navigation.state.params.from == 'viewGroupDetails'){
            this.setState({
                activeTab:1
            })
        }
    }

    selectActiveTab =(id)=> {
        this.setState({
            activeTab: id
        })
    }

    render(){
        const { navigation } = this.props
        return (
            <Block>
                <CustomHeader navL={navigation} left={<Ionicons name="md-arrow-back" size={24} color={theme.colors.gray2}/>}/>
               <Tabs>
                   <Tab  title={
                       <TouchableOpacity onPress={()=> this.selectActiveTab(0)}>
                           <Text title style={styles.tabText}>Chats</Text>
                        </TouchableOpacity>
                   }
                   active={this.state.activeTab == 0? true: false}
                   />

            <Tab  title={
                     <TouchableOpacity onPress={()=> this.selectActiveTab(1)}>
                        <Text title style={styles.tabText}>Groups</Text>
                    </TouchableOpacity>
                }
                active={this.state.activeTab == 1? true: false}
                />
               </Tabs>
                {
                    this.state.activeTab == 0?
                        <MessageList navigation={navigation} />
                    :
                    <GroupChatList navigation={navigation} />
                }
            </Block>
        )
    }
}

const styles = StyleSheet.create({
    
})

export default MessageView