import React, { Component } from 'react'
import { KeyboardAvoidingView,StyleSheet, ActivityIndicator } from 'react-native'
import  {Button, Block, Text, Input} from '../components'
import { theme } from '../constants'
import * as validate from '../config/validate'
import * as actions from '../constants/store/utils/actions'

import {connect} from 'react-redux'

class Signup extends Component {

    state = {
        username: 'User',
        email: 'contact@email.com',
        password: 'password',
        confirm_password : 'password',
        errors: [],
        loading: false,
    }


    handleSignup(){
        const {email, username, password, confirm_password} = this.state;
    
        const errors = []
        this.setState({ loading: true })
        const { navigation } = this.props;
        

        // Check With Backend API or with some static data
        if( (password !== confirm_password) || !(validate.validate(email, 'email').success ) || !( validate.validate(password, 'password').success ) || !( validate.validate(confirm_password, 'confirm_password', confirm_password ).success )){
    
        let emailError = validate.validate(email, 'email')
        let passwordError = validate.validate(password, 'password')
        let comfirmPasswordError = validate.validate(confirm_password, 'confirm_password', confirm_password )
        

        if(!emailError.success){
            errors.push('email' , validate.validate(email, 'email'))
        }

        if(!passwordError.success){
            errors.push('password',validate.validate(password, 'password'))
        }

        if(password !== confirm_password){
            errors.push('confirm_password', comfirmPasswordError)
        }
            
            this.setState({ 
                errors: errors,
                loading: false
            })
            this.setState({ errors, loading: false })
            
        }else{
                this.setState({ errors:[], loading: false })
                this.props.Signup({email, password, username})
    
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

        return (
            <KeyboardAvoidingView style={styles.login} >
                <Block padding={[0, theme.sizes.base * 2]} >
                    <Block middle >
                    { this.setErrorMessage() }

                        <Input 
                            label="Username"
                            style={[styles.input, hasErrors('email')]}
                            defaultValue={this.state.username}
                            onChangeText={ (text) => this.setState({ username: text  })}
                        />

                        <Input 
                            label="Email"
                            style={styles.input}
                            defaultValue={this.state.email}
                            onChangeText={ (text) => this.setState({ email: text  })}
                        />

                        <Input 
                            secure
                            label="Password"
                            style={[styles.input, hasErrors('password'), hasErrors('confirm_password')]}
                            defaultValue={this.state.password}
                            onChangeText={ (text) => this.setState({ password: text  })}
                        />

                        <Input 
                            secure
                            label="confirm_password"
                            style={[styles.input, hasErrors('confirm_password'), hasErrors('password') ]}
                            defaultValue={this.state.confirm_password}
                            onChangeText={ (text) => this.setState({ confirm_password: text  })}
                        />


                        <Button gradient onPress={() => this.handleSignup()}>
                           <Text bold center white>{this.state.loading? <ActivityIndicator size="small" /> : "Sign up" }</Text>
                        </Button>
                    </Block>
                </Block>
            </KeyboardAvoidingView>
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
        user: state.auth.user,
        logginErrors: state.auth.error,
    }
}   

const mapDispatchToProps = (dispatch) => {
    return {
        Signup: (data) => dispatch(actions.register(data)) 
     }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup)