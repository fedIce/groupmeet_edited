import React, { Component } from 'react'
import { Block, Text } from '../components'
import {CustomHeader} from '../components/header'
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons'
import {theme} from '../constants'
import { firestoreConnect } from 'react-redux-firebase'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { AsyncStorage, View } from 'react-native'
import SelectUsersList from './SelectUsersList'
import { StyleSheet, TouchableOpacity, Image, FlatList, Modal } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import firebase from '../config/firebaseCon'
import moment from 'moment'
import Builder, { DB } from 'crane-query-builder'; // Import the library
import Event from '../config/Event'





const db = firebase.firestore()


class MessageList extends Component {
    state ={
        showModal: false,
        firstQuery: '',
        lastVisibleUsersPost: null,
        users: [],
        localUsers: [],
        tempList: []
    }

    componentDidMount(){
        this.LoadUsers()
        this.LoadUsers_Local()
    }


    LoadUsers = async () => {
    
        this.setState({ isLoading: true })
        var tempFeeds = []
    
        var first = await db.collection("Users")
        .where('username', '>=', this.state.firstQuery)
        .where('username', '<', this.state.firstQuery + 'z' )
        .limit(10);

        return first.get().then((documentSnapshots) => {
        // Get the last  document
        var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
            this.setState({ lastVisibleUsersPost: lastVisible })

            documentSnapshots.forEach(doc => {
                tempFeeds.push({uid: doc.id, data: doc.data() })
                // console.log(doc.id)
            })
        }).then(() => {
            this.setState({ users: tempFeeds })
        });

    }

    getUnique = (arr, comp) =>  {

        // store the comparison  values in array
       const unique =  arr.map(e => e[comp])

           // store the indexes of the unique objects
           .map((e, i, final) => final.indexOf(e) === i && i)

           // eliminate the false indexes & return unique objects
           .filter((e) => arr[e]).map(e => arr[e]);

       return unique;
       }


    LoadUsers_Local = async () => {


        let top = []

        const users = await Builder()
                            .table("ChatList")
                            .get()

        if(users.length > 0){
            
            const temp = users
            const AsyncTempUsers = await AsyncStorage.getItem("TempNewMsg")

            console.log("Inner: ", AsyncTempUsers)

            if(AsyncTempUsers !== null){
               
                    JSON.parse(AsyncTempUsers).map( d => {
                        temp.push(d)
                    })


               
            }

            
           

            const allUsers = await temp.map( async user => {
                return await Event.shared.returnUserOnlineStatus(user.senderId).then( async data => {
                    
                    
                        if(data){
                            return {...user, onlineStatus: data.onlineStatus, lastSeen: data.lastSeen }
                        }else{
                            return {...user}
                        }
                    
                })
            })

            await Promise.all(allUsers).then(async (userData) => {

                top = await this.getUnique(userData,'senderId')
                top = await top.sort((a, b) => new Date(a.lastMessage_time) < new Date(b.lastMessage_time) ? 1 : -1)

                
                this.setState({localUsers: top})
            })
            
          

           
        }else{
            const AsyncTempUsers = await AsyncStorage.getItem("TempNewMsg")

            if(AsyncTempUsers !== null || AsyncTempUsers.length > 0){
               
                    JSON.parse(AsyncTempUsers).map(async d => {
                        const hasItem = await top.filter( (member) => member.senderId == d.senderId ).length > 0 
                        console.log("Top: ",top)
                        if(!hasItem){
                            top.push(d)
                        }
                    })
                    this.setState({localUsers: top })
            }
        }
                        
    }


    onLoadMoreUsers = async () => {

        var tempFeeds = []
         // Construct a new query starting at this document,
        // get the next 25 cities.
        var next = db.collection("Users")
                .where('username', '>=', this.state.firstQuery)
                .where('username', '<', this.state.firstQuery + 'z' )
                .startAfter(this.state.lastVisibleUsersPost)
                .limit(10);

        next.get().then((documentSnapshots) => {
            // Get the last  document
            var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
                this.setState({ lastVisibleUsersPost: lastVisible })
    
                documentSnapshots.forEach(doc => {
                    tempFeeds.push({uid: doc.id, data: doc.data() })
                })
            }).then(() => {
                this.state.users.concat(tempFeeds)
            });
    }

    updateList = () => {
        this.LoadUsers_Local()
        this.props.navigation.state.params.new()
    }

    filterSearch =(val) => {

        this.LoadUsers()

        this.setState({ firstQuery: val.nativeEvent.text })
    }


    openModal =() => {
        this.setState({ showModal: true })
    }

    closeModal =() => {
        this.setState({ showModal: false })
    }

    render(){

        const {navigation} = this.props

        const {users} = this.state

        return (
            <Block>
                <Block>
                    {
                        this.state.localUsers.length > 0 ?
                        <View>
                            <FlatList 
                        data={this.state.localUsers}
                        extraData={this.state.localUsers}
                        renderItem={({item, index}) => {
                            return (
                                <TouchableOpacity onPress={() => navigation.navigate('chats',{
                                    item: {
                                        uid: item.senderId,
                                        username:item.senderName,
                                        avatar:item.senderAvatar,
                                        updateList: this.updateList,
                                    }
                                })}>
                                    <Block row center style={styles.listItem} >
                                    <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />
                                    {item.onlineStatus? <View style={styles.onlineDot}></View>: null}
                                    <Block>
                                        <Text bold style={{ paddingVertical: 5, color: item.count == 1? theme.colors.primary : theme.colors.black}}>{item.senderName}</Text>
                                        {/* <Text caption color={theme.colors.gray2}>{ item.lastSeen? item.onlineStatus?  "Online" :  moment(item.lastSeen).fromNow()  : " "}</Text> */}
                                        <Text caption color={theme.colors.gray2}>{ item.last_message && item.last_message.length > 30? `${item.last_message.slice(0,30)}...` : item.last_message }</Text>
                                    </Block>
                                    </Block>
                                </TouchableOpacity>
                            )
                        }}
                        numColumns={1}
                        keyExtractor={(item, index) => item.id }
                    />

                        </View>
                        :
                        <Block center middle>
                            <View style={{ paddingHorizontal: 60, alignItems:'center' }}>
                                <Text bold color={theme.colors.option}>No Chat Sessions</Text>
                                <Text color={theme.colors.gray} style={{ textAlign:'center' }}> Click on the plus (+} icon on the lower right side of the screen to start a chat session</Text>
                            </View>
                        </Block>
                    }
                </Block>
                <TouchableOpacity onPress={() =>  this.openModal()} style={styles.floatingBtn}>
                    <Feather name="plus" size={25} color={theme.colors.white} />
                </TouchableOpacity>
                <Modal 
                    visible={this.state.showModal}
                    transparent={true}
                    animationType='slide'
                   
                >   
                <Block  style={{ backgroundColor: theme.colors.semiTransBlack }}>
                  
                    <Block style={styles.popList}>
                        <Block row flex={1} style={styles.searchArea}>
                            <TextInput onChange={(val) => this.filterSearch(val)} style={styles.searchBar} multiline={false} placeholder="Search..." />
                            <TouchableOpacity>
                                <Feather name="search" size={20} color={theme.colors.gray2 }/>
                            </TouchableOpacity>
                        </Block>
                        <Block flex={12}>
                        <FlatList 
                        data={users}
                        renderItem={({item, index}) => {
                            return (
                                <TouchableOpacity onPress={() => navigation.navigate('chats',{
                                    item: {
                                        ...item.data,
                                        updateList: this.updateList
                                    }
                                })}>
                                    <Block row center style={styles.listItem} >
                                    <Image source={{ uri: item.data.avatar }} style={styles.avatar} />
                                    <Block>
                                        <Text bold style={{ paddingVertical: 5, color: theme.colors.black}}>{item.data.username}</Text>
                                        <Text caption color={theme.colors.gray2}>last Message</Text>
                                    </Block>
                                    </Block>
                                </TouchableOpacity>
                            )
                        }}
                        numColumns={1}
                        keyExtractor={(item, index) => item.uid }
                    />
                        </Block>
                    </Block>
                    <TouchableOpacity  onPress={() =>  this.closeModal()} style={styles.closeModalBtn}>
                       <Feather name="x" size={25} color={theme.colors.white} />
                   </TouchableOpacity>
                </Block>
                </Modal>
            </Block>
        )
    }
}

const styles = StyleSheet.create({
avatar:{
    width: 56,
    height: 56,
    borderRadius: 23,
    marginHorizontal: 20,
    borderColor: '#e7e7e7',
    borderWidth: 1

},
listItem: {
    paddingVertical: 20,
    backgroundColor: theme.colors.white,
    marginVertical: 1
},
floatingBtn:{
    backgroundColor: theme.colors.primary,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    position: 'absolute',
    bottom: 20,
    right: 20
},
popList:{
    backgroundColor: theme.colors.white,
    marginHorizontal: 20,
    marginTop: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 10,
    paddingTop: 20,
},
searchArea:{
    borderColor: theme.colors.gray2,
    borderWidth: 1,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 20,
    maxHeight: 50
},
searchBar:{
    width: '90%',
    paddingHorizontal: 20
},
closeModalBtn: {
    backgroundColor: theme.colors.accent,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    position: 'absolute',
    top: 10,
    right: 10
},
onlineDot:{
    width:10,
    height: 10,
    borderRadius: 5, 
    backgroundColor: theme.colors.secondary,
    position: "absolute",
    marginLeft:5
   
}
})


const mapStateToProps =(state)=>{
    // console.log("Al Users", Object.values(state.firestore.data.Users))
    return {
        allUsers: Object.values(state.firestore.data.Users),
    }
}

export default compose(connect(mapStateToProps, null), firestoreConnect([
    { 'collection': 'Users'}
]))(MessageList)