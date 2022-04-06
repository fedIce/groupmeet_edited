import React, { Component } from 'react';
import {Animated, Dimensions, Image, FlatList, Modal, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

import {Button, Block, Text} from '../components'
import { theme } from '../constants';
import firebase from 'firebase'

const {width, height} = Dimensions.get('window')

export default class Welcome extends Component {

    state = {
        loadingApp: false
    }

    componentDidMount(){
        this.setState({ loadingApp: true})
        firebase.auth().onAuthStateChanged(user => {
            this.setState({ loadingApp: false})
            this.props.navigation.navigate(user? 'Root' : 'Auth')
        })
            
        
    }

    static navigationOptions = {
        header: null,
    }

    scrollX = new Animated.Value(0)
    
    state = {
        showModal: false
    }

    renderIllustrations(){
        const {illustrations} = this.props
        return (
            <FlatList
                horizontal
                pagingEnabled
                scrollEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                snapToAlignment="center"
                data={illustrations}
                extraData={this.state}
                keyExtractor={(item, index) => `${item.id}` }
                renderItem={({item}) => (
                    <Image 
                    source={item.source}
                    resizeMode="contain"
                    style={{ width, height: height / 2, overflow: 'visible' }} />
                )}
                onScroll = {
                    Animated.event([
                        { 
                            nativeEvent: { contentOffset: { x: this.scrollX } },
                        }
                    ])
                }
            />
        )
    }

    renderSteps(){
        const {illustrations} = this.props;
        const stepPosition = Animated.divide(this.scrollX, width)
         return (
             <Block row center middle style={styles.stepsContainer}>
                 {illustrations.map((item, index)=>{
                     const opacity = stepPosition.interpolate({
                         inputRange: [index - 1,  index, index + 1],
                         outputRange: [0.4, 1,0.4],
                         extrapolate: 'clamp',
                     })
                     return(
                         <Block animated flex={false} key={`step-${index}`} color="gray" style={[styles.step, { opacity } ]}/>
                     )
                 })}
             </Block>
         )
    }

    showTermsOfService(){
        return (
            <Modal animationType="slide" visible={this.state.showModal} >
                <Block flex={0.9} center padding={theme.sizes.padding} space="between"> 
                    <Text h2 light>Terms of Service</Text>
                <ScrollView>   
                    <Text caption gray height={18}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
                    </Text>
                    <Text caption gray height={18}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
                    </Text>
                    <Text caption gray height={18}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
                    </Text>
                    <Text caption gray height={18}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
                    </Text>
                    <Text caption gray height={18}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
                    </Text>
                    <Text caption gray height={18}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
                    </Text>
                </ScrollView>
                </Block>
                <Block flex={0.1} middle bottom margin={[0, theme.sizes.padding * 2]}>
                    <Button gradient onPress={() => this.setState({ showModal: false })}>
                        <Text center white>I Understand</Text>
                    </Button>
                </Block>
            </Modal>
        )
    }

    render(){
        const {navigation} = this.props;
        return (
            <Block>
                <Block center bottom flex={0.5}>
                    <Text h1 center bold color={'#AF697D'}>
                        NEU SOCIAL. 
                    <Text h1 primary> Trilling</Text>
                    </Text>
                    <Text h3 gray2 style={{ margin: theme.sizes.padding/2}}>
                        Enjoy The Experience.
                    </Text>
                </Block>
                <Block center middle>
                    {this.renderIllustrations()}
                    {this.renderSteps()}
                </Block>
                <Block middle flex={0.5} margin={[0, theme.sizes.padding * 2]}>
                    <Button gradient onPress={() => navigation.navigate('Signup')}>
                        <Text semibold center white>SignUp</Text>
                    </Button>
                    <Button shadow onPress={() => navigation.navigate('Login')}>
                        <Text semibold center>Login</Text>
                    </Button>
                </Block>  
                    <Button  onPress={() => this.setState({ showModal: true })}>
                        <Text semibold center caption gray>Terms Of Service</Text>
                    </Button>
                {this.showTermsOfService()}
                <Modal 
                visible={this.state.loadingApp}
                transparent={true}
                >
                    <Block style={{backgroundColor: theme.colors.semiTransWhite}} center middle>
                        <ActivityIndicator size="large" /> 
                        <Text>Please Wait...</Text>
                    </Block>
                </Modal>
            </Block>
        )
    }
}

Welcome.defaultProps = {
    illustrations: [
        {id:1, source: require('../assets/images/illustration_1.png')},
        {id:2, source: require('../assets/images/illustration_2.png')},
        {id:3, source: require('../assets/images/illustration_3.png')}
    ]
}

const styles = StyleSheet.create({
stepsContainer: {
    position: 'absolute',
    bottom: theme.sizes.base * 3,
    right: 0,
    left: 0
},
step: {
    width: 5,
    height: 5,
    borderRadius: 5,
    marginHorizontal: 2.5
},
})