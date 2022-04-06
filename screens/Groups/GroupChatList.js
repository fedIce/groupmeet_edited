import React, { Component } from 'react'
import { Block, Text } from '../../components'
import {CustomHeader} from '../../components/header'
import { Ionicons, FontAwesome5, Feather, createIconSetFromFontello } from '@expo/vector-icons'
import {theme} from '../../constants'
import { firestoreConnect } from 'react-redux-firebase'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native'
import {FetchFollowersAccounts} from '../../constants/store/utils/actions'
import moment from 'moment'


class GroupChatList extends Component {

    state={
        accounts : []
    }

    componentDidMount(){
        this.props.getListOfFollowings()
        this.setState({ accounts: this.props.allUsers })
    }

    runfilter =( query ) => {
        this.setState({
            accounts: this.state.accounts.filter( user => user.username.includes(query) )
        })
    }

    render(){

        const {navigation} = this.props
        const {filter} = this.props
        const {registeredGroups} = this.props.userData? this.props.userData : []
        console.log(registeredGroups)
        
        return this.props.userData? (
            <Block>
               { 
               registeredGroups != null && registeredGroups.length > 0?
               <Block>
                    <FlatList 
                        data={registeredGroups}
                        renderItem={({item, index}) => {
                            return (
                                <TouchableOpacity onPress={() => navigation.navigate('groupChat',item)}>
                                    <Block row center style={styles.listItem} >
                                    <Image source={{ uri: `https://robohash.org/${(Math.random() * 100) + 1}.png?set=${item.groupId}` }} style={styles.avatar} />
                                    <Block>
                                        <Text bold style={{ paddingVertical: 5, color: theme.colors.black}}>{item.groupName}</Text>
                                        <Text caption color={theme.colors.gray2}>Closes {item.registration_close_date && moment((typeof item.registration_close_date != 'string')? item.registration_close_date.toDate(): Date.parse(item.registration_close_date)).fromNow()}</Text>
                                    </Block>
                                    </Block>
                                </TouchableOpacity>
                            )
                        }}
                        numColumns={1}
                        keyExtractor={(item, index) => item.uid }
                    />

                </Block>
                :
                <Block center middle>
                    <Text caption color={theme.colors.gray3} >You are not Currently registered in any Groups</Text>
                </Block>    
            }
            </Block>
        ):
        null
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
}
})


const mapStateToProps =(state)=>{
    return {
        allUsers: state.followingAccounts.accounts,
        user: state.firebase.auth,
        userData: state.firestore.data.ActiveUser,

    }
}

const mapDispatchToProps =(dispatch)=>{
    return {
        getListOfFollowings : () => dispatch(FetchFollowersAccounts())
    }
}

export default compose(connect(mapStateToProps, mapDispatchToProps), firestoreConnect((props) => {
   return [
        { 
            collection: 'Users',
            doc: props.user.uid,
            storeAs: 'ActiveUser'
        },
    ]
}
    
))(GroupChatList)