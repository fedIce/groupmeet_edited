import React, { Component, useEffect } from 'react';
import { View, TextInput, StyleSheet, Switch, Modal, ActivityIndicator, ScrollView } from 'react-native';
import MultiSelect from 'react-native-multiple-select';
import { Block, Text, Button } from '../../components'
import firebase from 'firebase'
import  {CustomHeader } from '../../components/header'
import { Ionicons, Feather } from '@expo/vector-icons'
import { theme } from '../../constants'
import { TouchableOpacity } from 'react-native-gesture-handler';
import {connect} from 'react-redux'
import {addGroupAccessories, fetchGroupAccessories} from '../../constants/store/utils/actions'
import Event from '../../config/Event'


class CreateGroupForm1 extends Component {

    state = {
        selectedItems : [],
        selectableItems : [],
        isEnabled: false,
        newItem: '',
        loading: false
      };
     
      items = [{
        id: 'Airplane Ticket',
        name: 'Airplane Ticket',
      }, {
        id: 'Boat Cruize Ticket',
        name: 'Boat Cruize Ticket',
      }, {
        id: 'Football Stadium Tickets',
        name: 'Football Stadium Tickets',
      }, {
        id: 'Vehicle Rent Out',
        name: 'Vehicle Rent Out',
      }, {
        id: 'Villa Rent Out',
        name: 'Villa Rent Out',
      }, {
        id: 'Hotel Reservations',
        name: 'Hotel Reservations',
      }, {
        id: 'Restaurant Reservations',
        name: 'Restaurant Reservations',
      }, {
        id: 'Tour Guide Reservation',
        name: 'Tour Guide Reservation',
      }, {
        id: 'Stake House Reservation',
        name: 'Stake House Reservation',
      }];


      componentWillMount(){


        const access = Event.shared.fetchGroupAccessories(this.props.navigation.state.params.groupId)
         access.then(data => {
          this.setState({ selectableItems: data })
          console.log('PROPS: ',this.props.navigation.state.params)
         }) 
           

      }

      getTotalPrice = () => {

        if(this.state.selectableItems.length <= 0){
          return null
        }


        if(!(this.props.navigation.state.params.from && this.props.navigation.state.params.from == 'groupForm_1')){

        var eventPrice = parseFloat(this.props.navigation.state.params.eventPrice)
        var splitable = this.props.navigation.state.params.eventChargingMethod
        var dbSplitablePrice = this.props.navigation.state.params.splitablePrice? parseFloat(this.props.navigation.state.params.splitablePrice) : parseFloat(eventPrice)
        }else{
          var {data} = this.props.navigation.state.params.prop.navigation.state.params.post
          console.log('EVET PRICE: ', this.props.navigation.state.params.eventPrice)
          var eventPrice = parseFloat(this.props.navigation.state.params.eventPrice)
          var splitable = data.group.groupChargingMethod
        }
       
        var prices = [0]
        var splitPrice = [0]
        var nonSplitablePrice = [0]

        

        if(!(this.props.navigation.state.params.from && this.props.navigation.state.params.from == 'groupForm_1')){
          if(splitable == 'FullPrice' || splitable == 0){
            prices.push(eventPrice)
            nonSplitablePrice.push(eventPrice)
          }else if(splitable == 'SplitEqually'){ 
            prices.push(eventPrice / this.props.navigation.state.params.group.members.length )
            splitPrice.push(eventPrice / this.props.navigation.state.params.group.members.length )
          }else{
            prices.push( eventPrice - ((( this.props.navigation.state.params.group.members.length * splitable)/100) * eventPrice) )
            splitPrice.push( eventPrice - ((( this.props.navigation.state.params.group.members.length * splitable)/100) * eventPrice) )
          }
        }else{
          
          if(splitable == 'FullPrice' || splitable == 0){
            prices.push(eventPrice)
            nonSplitablePrice.push(eventPrice)
          }else if(splitable == 'SplitEqually'){ 
            prices.push(eventPrice )
            splitPrice.push(eventPrice )
          }else{
            prices.push( eventPrice - ((( 1 * splitable)/100) * eventPrice) )
            console.log('---: ', eventPrice - ((( 1 * splitable)/100) * eventPrice) )
            splitPrice.push( eventPrice - ((( 1 * splitable)/100) * eventPrice) )
          }
        }


        this.state.selectableItems.map( item => {
          !Number.isNaN(parseFloat(item.price)) && prices.push(parseFloat(item.price) )

          if(item.splitable && this.props.navigation.state.params.group){
            if(!(this.props.navigation.state.params.from && this.props.navigation.state.params.from == 'groupForm_1')){

              splitPrice.push( parseFloat(item.price) / this.props.navigation.state.params.group.members.length )
            }else{
              splitPrice.push( parseFloat(item.price) )

            }
          }else{
             nonSplitablePrice.push(parseFloat(item.price))
          }
        })

        if(!(this.props.navigation.state.params.from && this.props.navigation.state.params.from == 'groupForm_1')){
          return {totalPrice: prices.reduce((a, b) => a + b), afterSplit: splitPrice.reduce((a, b) => a + b),unSplitablePrices: nonSplitablePrice.reduce((a, b) => a + b) }
        }else{
          return {totalPrice: prices.reduce((a, b) => a + b), afterSplit: splitPrice.reduce((a, b) => a + b),unSplitablePrices: nonSplitablePrice.reduce((a, b) => a + b) }

        }

      }


      toggleLoading =(value) => {
        this.setState({ loading: value })
    }

       setIsEnabled = (id) => {
        var temp = []
        this.state.selectableItems.map( item => {
          if(id == item.itemId){
            item.splitable = !item.splitable
          }

         return temp.push(item)
        })

        this.setState({ selectableItems: temp})
    }

    removeItem =(id) => {
      var temp = []
      this.state.selectableItems.map( item => {
        if(id != item.itemId){
          
          return temp.push(item)
        }

      })

      this.setState({ selectableItems: temp})
    }

    updatePrice = (id, price) => {
     var temp = []
     this.state.selectableItems.map( item => {
       if(id == item.itemId){
         item.price = price
       }

      return temp.push(item)
     })

     this.setState({ selectableItems: temp})
 }
    
     SelectedItemInput = (item, splitable, id, price) => {
        const toggleSwitch = (id) => this.setIsEnabled(id);
        const priceUpdate = (price) => this.updatePrice(id, price);
        return (
            <View style={styles.inputItem}>
                <TouchableOpacity onPress={() => this.removeItem(id)} style={{ alignSelf: 'flex-end'}} ><Feather name="x" size={24} color={theme.colors.gray}  /></TouchableOpacity>
                <View style={styles.inputContainer}>
                    <Text>{item} Price</Text>
                    <TextInput onChange={(val) => priceUpdate(val.nativeEvent.text)} value={price} keyboardType="numeric" style={styles.input} placeholder="0.00" />
                </View>
                <View style={[{ flexDirection: 'row', justifyContent: 'space-between'}, styles.inputContainer]}>
                    <Text>Price is Splitable </Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={this.state.isEnabled ? theme.colors.secondary : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onChange={() => toggleSwitch(id)}
                        value={splitable}
                    />
                </View>
            </View>
        )
    }

      onSelectedItemsChange = selectedItems => {

        var temp = []
        var update = false
        this.state.selectableItems.map( item => {
          if(selectedItems.includes(item.itemId) || item.fromAdd ){
            temp.push(item)
          }else{
            update = true
          }
        })
        if( update == true ){
          this.setState({ selectableItems: temp, selectedItems })
          return
        }else{
          this.setState({ selectableItems: [...temp,{
            item: selectedItems[selectedItems.length - 1 ],
            itemId: selectedItems[selectedItems.length - 1],
            splitable: false,
            price: 0,
          }],
        selectedItems });
        }

       

      };

      onAddNewItem =(selectedItems) => {

          if(selectedItems == ''){
            return
          }else{

            this.setState({ selectableItems: [...this.state.selectableItems,  {
              itemId: selectedItems,
              item: selectedItems,
              price: 0,
              splitable: false,
              fromAdd: true
  
            }], newItem:''})

          }
          this.textInput.clear()
      }

    joinGroup = async (groupId) => {

      console.log("! Group Price: ",this.getTotalPrice())
      
      this.props.addAccessories( this.state.selectableItems, {groupId, prices: this.getTotalPrice()} )
      this.props.navigation.navigate('groupChat', {groupId, prices: this.getTotalPrice()})
    }

    goToNext = (groupId) => {
    
      this.props.addAccessories( this.state.selectableItems, {groupId, prices: this.getTotalPrice()} )
      this.props.navigation.goBack()

    }

    render(){
        const { selectedItems } = this.state;
        const { params } = this.props.navigation.state
        return (
          <Block >
               <CustomHeader left={
                    <Ionicons name="md-arrow-back" size={24} color={theme.colors.gray2}/>
                } 
                navL={this.props.navigation}
                />

                <Block flex={9} style={{ padding: 20}}>
                    <Text bold style={{ marginVertical: 10, marginBottom: 20}}>What do you need for this event? </Text>
                    <MultiSelect
                    hideTags
                    items={this.items}
                    uniqueKey="id"
                    ref={(component) => { this.multiSelect = component }}
                    onSelectedItemsChange={this.onSelectedItemsChange}
                    selectedItems={selectedItems}
                    selectText="    Pick Items"
                    searchInputPlaceholderText="Search Items..."
                    // onChangeInput={ (text)=> console.log(text)}
                    tagRemoveIconColor="#CCC"
                    tagBorderColor="#CCC"
                    filterMethod="partial"
                    tagTextColor="#CCC"
                    selectedItemTextColor="#CCC"
                    selectedItemIconColor="#CCC"
                    itemTextColor="#000"
                    displayKey="name"
                    searchInputStyle={{ color: '#CCC' }}
                    submitButtonColor={theme.colors.secondary}
                    submitButtonText="Submit"
                    />
                    <View>
                      <ScrollView style={{ marginBottom: 80 }}>
                       
                        {
                              this.state.selectedItems && this.state.selectableItems.map( item => {
                                return this.SelectedItemInput(item.item, item.splitable, item.itemId, item.price)
                            })
                        }
                         <View style={styles.inputItem}>
                            <TextInput ref={input => { this.textInput = input }}  onChangeText={(item) => this.setState({ newItem: item})} style={styles.input} placeholder="Manually Add Item" />
                             <Button onPress={() => this.onAddNewItem(this.state.newItem)} style={{ backgroundColor: theme.colors.secondary}}><Text white bold center>Add Item</Text></Button>
                         </View>
                    </ScrollView>
                    </View>
                   
            </Block>
            <View  >
             {
               this.props.navigation.state.params.fromViewDetails?
               <Button onPress={() => this.goToNext(params.groupId)} style={{ width: '99%', paddingHorizontal: 20}} gradient ><Text white bold center>Done</Text></Button>

               :

               <Button onPress={() => this.joinGroup(params.groupId)} style={{ width: '99%', paddingHorizontal: 20}} gradient ><Text white bold center>Finish</Text></Button>

             }
            </View>
            <Modal
                    animationType="fade"
                    presentationStyle="overFullScreen"
                    transparent={true}
                    visible={this.state.loading}
                >
                    <Block center flex={1} style={styles.loadingModal}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </Block>
                </Modal>
          </Block>
        );
    }
}

const styles = StyleSheet.create({
    input:{
        borderBottomColor: theme.colors.gray,
        borderBottomWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 5
    }, 
    inputContainer:{
        marginVertical: 10,
    },
    inputItem:{
        backgroundColor: theme.colors.white,
        padding: 10,
        marginVertical: 5,
        width: '100%'
    },
    loadingModal:{
        alignItems: 'center',
        justifyContent:'center',
        width: '100%',
        height:'100%',
        backgroundColor:'rgba(255,255,255, .8)' 
    }
})

const mapStateToProps =(state) => {
  // console.log(state.accessories)
  return {
    accessories: state.accessories  
  }
}

const mapDispatchToProps =(dispatch) => {
  return {
    addAccessories: (items, group) => dispatch(addGroupAccessories(items, group)),
    fetchAccessories: (groupId) => dispatch(fetchGroupAccessories(groupId))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateGroupForm1)