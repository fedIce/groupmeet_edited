import React, {Component} from 'react'
import { MenuCard } from '../../components/mediaMenu'
import { Dimensions } from 'react-native'
import  {CustomHeader } from '../../components/header'
import  {Block } from '../../components'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../../constants'

const {width} = Dimensions.get('window')

class GroupSingle extends Component {

    render(){

        const {navigation} = this.props
        // console.log(this.props.navigation.state.params)
        return (
            <Block >
                 <CustomHeader left={
                    <Ionicons name="md-arrow-back" size={24} color={theme.colors.gray2}/>
                } 
                navL={navigation}
                />
            <Block style={{ flex:1, width, alignItems:'center', justifyContent:'center' }}>
                <Block>
                <MenuCard title="Register Single" des="makePayment" prop={{...this.props.navigation.state.params,navigation: navigation }} url="https://cdn.pixabay.com/photo/2015/07/30/17/24/audience-868074_960_720.jpg" />
                </Block>
                <Block>
                    <MenuCard title="Register With Group" des="selectGroup" prop={{...this.props.navigation.state.params, navigation: navigation}} url="https://cdn.pixabay.com/photo/2017/02/19/16/01/mountaineer-2080138_960_720.jpg" />
                </Block>
            </Block>
             </Block>
        )
    }
}

export default GroupSingle