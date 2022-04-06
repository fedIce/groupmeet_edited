import React, { Component } from 'react'
import { Block, Text, Button } from '../../components'
import firebase from 'firebase'

class MakePayment extends Component {

    render(){
        console.log(this.props.navigation.state.params)
        return (
            <Block center middle>
                <Text>This Feature is not yet available</Text>
            </Block>
        )
    }
}

export default MakePayment