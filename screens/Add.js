import React, { Component } from 'react'
import { Block, Text } from '../components'
import { MenuCard } from '../components/mediaMenu'
import { Dimensions } from 'react-native'
import  {CustomHeader } from '../components/header'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../constants'
    import { Form } from 'native-base'

const {width} = Dimensions.get('window')


class Add extends Component {
    render(){
        const {navigation} = this.props;

        return (
            <Block >
                 <CustomHeader left={
                    <Ionicons name="md-arrow-back" size={24} color={theme.colors.gray2}/>
                } 
                navL={navigation}
                />
            <Block style={{ flex:1, width, alignItems:'center', justifyContent:'center' }}>
                <Block>
                <MenuCard title="Add Post" des="addPost" prop={{...this.props}} url="https://cdn.pixabay.com/photo/2015/07/30/17/24/audience-868074_960_720.jpg" />
                </Block>
                <Block>
                    <MenuCard title="Add Event" des="addEvent" prop={{...this.props}} url="https://cdn.pixabay.com/photo/2017/02/19/16/01/mountaineer-2080138_960_720.jpg" />
                </Block>
                {/* <Block>
                    <MenuCard title="Pitch Event Idea" des="addCredit" prop={{...this.props}} url="https://miro.medium.com/max/700/0*VahGQOMC2QALdQ_C.png" />
                </Block> */}
            </Block>
             </Block>
        )
    }
}

export default Add