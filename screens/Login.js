import React, { Component } from 'react'
import { KeyboardAvoidingView,StyleSheet, ActivityIndicator} from 'react-native'
import  {Button, Block, Text, Input } from '../components'
import  {CustomHeader } from '../components/header'
import { theme } from '../constants'
import * as validate from '../config/validate'
import * as actions from '../constants/store/utils/actions'


import {connect} from 'react-redux'
import { Ionicons } from '@expo/vector-icons'
import navigations from '../navigations'
import { TextInput } from 'react-native-gesture-handler'

class Login extends Component {
state = {
    email: 'contact@email.com',
    password: 'password',
    errors: [],
    loading: false,
    errorMessage: null
}


handleLogin = () => {
    const { navigation } = this.props;
    const {email, password } = this.state;

    const errors = []

    this.setState({ loading: true })

    // Check With Backend API or with some static data
    if( !(validate.validate(email, 'email').success ) || !( validate.validate(password, 'password').success )){
        let emailError = validate.validate(email, 'email')
        let passwordError = validate.validate(password, 'password')
        

        if(!emailError.success){
            errors.push('email' , validate.validate(email, 'email'))
        }

        if(!passwordError.success){
            errors.push('password',validate.validate(password, 'password'))
        }


        this.setState({ 
            errors: errors,
            loading: false
        })


    }else{
            this.setState({ errors: [], loading: false })
            this.props.Login({email, password})


            if(this.props.loggedIn){
                navigation.navigate('Root', {
                    user: this.props.user
                })
            }

    }

};

setErrorMessage = () => {
    
            if(this.props.logginErrors != null){
                    return (<Text center bold color={theme.colors.accent} >{this.props.logginErrors.message} </Text>)
            }else{
                return null
            }
    
}

    render(){

        const { navigation } = this.props;
        const { loading, errors } = this.state;
        const hasErrors = key => errors.includes(key)? styles.hasErrors: null;

        console.log("Loading: ", loading)

        return (
            <Block>
                <CustomHeader left={<Ionicons name="md-arrow-back" size={24} color={theme.colors.gray2}/>} navL={navigation}/>
            
                <KeyboardAvoidingView style={styles.login} behavior="height">
                    <Block padding={[0, theme.sizes.base * 2]} >

                        <Block middle >
                            { this.setErrorMessage() }

                            <Input 
                                label="Email"
                                style={[styles.input, hasErrors('email')]}
                                defaultValue={this.state.email}
                                onChangeText={ (text) => this.setState({ email: text  })}
                            />

                            <Input 
                                secure
                                label="Password"
                                style={[styles.input, hasErrors('password')]}
                                defaultValue={this.state.password}
                                onChangeText={ (text) => this.setState({ password: text  })}
                            />

                            <Button gradient onPress={() => this.handleLogin()}>
                                <Text bold center white>{this.state.loading? <ActivityIndicator size="small" /> : "Log In" }</Text>
                            </Button>

                            <Button onPress={() => {}}style={{ backgroundColor: 'transparent'}}>
                                <Text center gray caption style={{ textDecorationLine: 'underline' }}>Forgot Your password?</Text>
                            </Button>

                        </Block>
                    </Block>
                </KeyboardAvoidingView>
            </Block>
        )
    }
}



const styles = StyleSheet.create({
    login:{
        flex: 1,
        justifyContent: 'center'
    },
    input: {
        borderColor: 'transparent',
        borderRadius: 0,
        borderWidth: 0, 
        borderBottomColor: theme.colors.gray2,
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    hasErrors: {
        borderBottomColor: theme.colors.accent,
        borderBottomWidth: 1
    }
})



const mapStateToProps = (state) => {
    return {
        loggedIn: state.auth.isLoggedIn,
        logginErrors: state.auth.error,
        user: state.auth.user
    }
}   

const mapDispatchToProps = (dispatch) => {
    return {
        Login: (data) => dispatch(actions.login(data)) 
     }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
