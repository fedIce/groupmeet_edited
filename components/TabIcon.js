import React from 'react'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'
import {FontAwesome5, Feather} from '@expo/vector-icons'
import * as utils from '../config/validate'


export const TabIcon = (props) => {
    return (
        <View>
            <FontAwesome5 {...props} />
            {
                props.notificationCount > 0 ?
                    <View style={{ position: 'absolute', right: 10, top: 5, backgroundColor: 'red', borderRadius: 9, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: 'white' }}>{props.notificationCount}</Text>
                    </View> : null
            }
        </View>
    )
}


const mapStateToPorops = (state)=>{
    return {
        notificationCount: state.firestore.data.Users? utils.extractUser(state.firestore.data.Users, state.firebase.auth.uid).requests.length: null
    }
}

const mapDispatchToProps = (dispatch) => {
    return{

    }
}
export default connect( mapStateToPorops, mapDispatchToProps )(TabIcon)