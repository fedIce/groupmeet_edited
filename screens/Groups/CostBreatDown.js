import React, {Component} from 'react'
import { MenuCard } from '../../components/mediaMenu'
import { Dimensions, View, StyleSheet, FlatList } from 'react-native'
import  {CustomHeader } from '../../components/header'
import  {Block, Text } from '../../components'
import { Feather, Ionicons } from '@expo/vector-icons'
import { theme } from '../../constants'

const {width} = Dimensions.get('window')

class CostBreakDown extends Component {

    state = {
        accessories: [],
        fetched:false
    }

    componentDidMount(){
        
        console.log("ACCESSORIES: ",this.props.navigation.state.params.data)

        if(this.props.navigation.state.params.data){
            this.setState({ accessories: this.props.navigation.state.params.data, fetched: true })
        }
    }

    render(){

        const {navigation} = this.props
        // console.log(this.props.navigation.state.params)
        return this.state.fetched? (
            <Block >
                 <CustomHeader left={
                    <Ionicons name="md-arrow-back" size={24} color={theme.colors.white}/>
                } 
                navL={navigation}
                color={theme.colors.primary}
                />
                <Block>
                    <View style={styles.priceRegion}>
                        <View style={{ width:'40%'}}>
                            <Text caption  color={theme.colors.white}>Total Cost</Text>
                            <Text white bold style={{ fontSize: 40 }}>{parseFloat(this.state.accessories.totalPrice?this.state.accessories.totalPrice:this.state.accessories.groupPrice)}.<Text bold white>00</Text></Text>
                        </View>
                        <View style={{ width:'40%',alignItems:'flex-end'}}>
                            <Text caption  color={theme.colors.white}>Per Person Cost</Text>
                            <Text white bold style={{ fontSize: 40 }}>{parseFloat(this.state.accessories.groupPrice).toFixed(2).toString().split(".")[0]}.<Text bold white>{parseFloat(this.state.accessories.groupPrice).toFixed(2).toString().split(".")[1].slice(0,2)}</Text></Text>
                        </View>
                    </View>
                    <Block>
                        <FlatList 
                            data={this.state.accessories.accessories}
                            ListFooterComponent={() => {
                                return (
                                    <View style={styles.itemIndex}>
                                    <View>
                                        <Text bold h3 color={theme.colors.secondary}>
                                            Event Ticket Cost
                                        </Text>
                                        <Text caption color={theme.colors.gray}>
                                            {this.state.accessories.eventChargingMethod == 0? "Free" : this.state.accessories.eventChargingMethod == "FullPrice"? "Full Price" : this.state.accessories.eventChargingMethod == 'SplitEqually'? "Split Equally" : `${this.state.accessories.eventChargingMethod}% Discount everytime a member joins`} 
                                        </Text>
                                    </View>

                                    <Text bold color={theme.colors.primary}>
                                   {parseFloat(this.state.accessories.eventPrice).toFixed(2)} 
                                    </Text>
                                </View>
                        

                                )
                            }}
                            renderItem={({ item, index }) => {
                               return (
                                    <View style={styles.itemIndex}>
                                        <View>
                                            <Text bold h3>
                                                {item.item} 
                                            </Text>
                                            <Text caption color={item.splitable? theme.colors.secondary: theme.colors.accent}>
                                                {item.splitable? "Split" : "Unsplit"} 
                                            </Text>
                                        </View>

                                        <Text bold color={theme.colors.primary}>
                                            {item.price} 
                                        </Text>
                                    </View>
                               )
                            }}
                            keyExtractor={({item, index}) => { item.itemId }}
                            
                        />
                    </Block>
                </Block>

             </Block>
        ):(
            <Block center middle>
                <Text center>Loading</Text>
            </Block>
        )
    }
}

const styles = StyleSheet.create({
   priceRegion:{
    width, 
    flexDirection:'row', 
    alignItems:'center', 
    paddingHorizontal: 20, 
    justifyContent:'space-between', 
    height: 150, 
    backgroundColor: theme.colors.primary,
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth:1
   },
   itemIndex:{
       height: 80,
       flexDirection:'row',
       alignItems:'center',
       justifyContent:'space-between',
       paddingHorizontal: 15,
       width:'100%',
       backgroundColor: theme.colors.white,
       borderBottomColor: theme.colors.gray3,
       borderBottomWidth: 1
   }
})

export default CostBreakDown