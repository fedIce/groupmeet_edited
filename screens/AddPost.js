import React, { Component, useRef } from 'react'
import { Block, Text, Button } from '../components'
import { Animated, Image, TextInput, StyleSheet, Alert, Dimensions, SafeAreaView, Modal, ActivityIndicator } from 'react-native'
import { Ionicons, Feather } from '@expo/vector-icons'
import { theme } from '../constants'
import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'
import Fire from '../config/Fire'
import * as ImagePicker from 'expo-image-picker'
import Tags from "react-native-tags";
import {connect} from 'react-redux'


import  {Carousel}  from '../components/Carousel'
import { TouchableOpacity } from 'react-native-gesture-handler'

const {width} = Dimensions.get('window')
let tagx = []
let maxNumberOfImages = 3


class AddPosts extends Component {

    animBox = new Animated.Value(0)


   state = {
        type : '',
        media: [],
        likes: 0,
        comments: [],
        description: '',
        tags: [],
        aspect: [4, 3],
        loading: false
   }
 
   

   componentDidMount(){
        this.getPhotoPermissions();
   }

   handleAnimateBoxIn = () => {
        Animated.timing(this.animBox, {
            toValue: 1,
            duration: 200
        }).start()
   }

   handleAnimateBoxOut = () => {
        Animated.timing(this.animBox, {
            toValue: 0,
            duration: 200
        }).start()
}

toggleShowBox = (val) => {
    this.setState({ description: val.nativeEvent.text })
    if(this.state.description == '' || this.state.description == null || val.nativeEvent.text == ''){
        this.handleAnimateBoxOut()
    }else{
        this.handleAnimateBoxIn()
    }
}

   handlePost = () => {
       this.setState({loading: true })
       if(this.state.media.length > 0){
           Fire.shared.addPost({ type: 'Post', tags: tagx, text: this.state.description, localUri: this.state.media, avatar: this.props.user.photoURL , username: this.props.user.displayName})
            .then(ref => {
                this.setState({ description: "", media: [], loading: false }),
                this.props.navigation.navigate("Feeds",{ newPost: true })
            }).catch(err => alert(err))
        }
    }

   _pickImage = async () => {
       if(this.state.media.length < maxNumberOfImages){

           try {
           let result = await ImagePicker.launchImageLibraryAsync({
               mediaTypes: ImagePicker.MediaTypeOptions.All,
               allowsEditing: true,
               quality: 1,
            //    aspect: [1,1]
           });
           if (!result.cancelled) {
               this.setState({ media:[...this.state.media, { id: this.state.media.length + 1, source: result.uri }] });
           }
   
           } catch (E) {
               console.log(E);
           }
       }
    }
      

   getPhotoPermissions = async () =>{
       
            const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL)

                if(status != 'granted'){
                    Alert.alert("App needs your permission to accrss your Gallery")
                }else{
                    
                }
        
   }

   addTag = (tags)=>{
        tagx = tags
   }

    render(){
        const {description} = this.state;
        const { user } = this.props;

        return (
            <SafeAreaView style={{ flex:1 }}>
                <Block style={styles.header}>
                    <TouchableOpacity onPress={() =>  this.props.navigation.goBack()}>
                        <Ionicons name="md-arrow-back" size={25} color={theme.colors.gray} />
                    </TouchableOpacity>
                
               
                    <TouchableOpacity onPress={ () => this.handlePost() }>
                        <Text bold>Post</Text>
                    </TouchableOpacity>
                </Block>
               
                <Block style={styles.inputContainer}>
                    <Image style={styles.avatar} source={{ uri: user.photoURL}} ></Image> 
                    <TextInput autoFocus={true} multiline={true} numberOfLines={4} maxLength={1200} placeholder="Want to share something?" style={{ flex: 1 , alignSelf: 'flex-start' }}
                        onChange={(val) => this.toggleShowBox(val) }
                    ></TextInput>
                </Block>
                <Block style={styles.iconContainer}>
                    {/* <Button opacity={true} style={{ backgroundColor: theme.colors.transparent}} >
                        <Ionicons name="md-videocam" size={24} color={theme.colors.gray} />
                    </Button> */}

                    <Button  opacity={true} style={styles.iconBtns} onPress={this._pickImage} >
                        <Ionicons name="md-camera" size={24} color={this.state.media.length < maxNumberOfImages? theme.colors.gray: theme.colors.gray3} />
                    </Button>
                </Block>
                <Block style={styles.tags}>
                    <Text bold color={theme.colors.gray2} style={{ marginHorizontal: 10 }}>Tags: <Text caption gray style={{ fontSize: 10 }}> ( Enter tags seperated by a space, click on a tag to delete it ) </Text></Text>
                    <Tags
                        textInputProps={{
                            placeholder: "#BoatCruise"
                        }}
                        initialTags={[]}
                        onChangeTags={tags => this.addTag(String.prototype.toLowerCase(tags))}
                        onTagPress={(index, tagLabel, event, deleted) =>
                            console.log(index, tagLabel, event, deleted ? "deleted" : "not deleted")
                        }
                        containerStyle={{ justifyContent: "center" }}
                        inputStyle={{ fontSize: 10 }}
                        renderTag={({ tag, index, onPress, deleteTagOnPress, readonly }) => (
                            <TouchableOpacity key={`${tag}-${index}`} onPress={onPress}>
                            <Text caption bold color={theme.colors.gray}> #{tag}</Text>
                            </TouchableOpacity>
                        )}
                        />
                </Block>
                <Block style={styles.postPreview}>
                    <Block style={styles.postImage}>
                         <Carousel illustrations={this.state.media} />
                    </Block>
                    <Block animated={true} style={[styles.showDes, { opacity : this.animBox  }]}>
                        <Text caption >{description}</Text>
                    </Block>
                </Block>
                <Modal
                visible={this.state.loading}
                transparent={true}>
                    <Block center middle>
                            <ActivityIndicator size="large" />
                    </Block>

                </Modal>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    inputContainer:{
        flex: 1,
        margin: 32,
        flexDirection: 'row'
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16,
        marginTop: 16
    },
    iconBtns:{
         backgroundColor: theme.colors.transparent,
         marginHorizontal:26
    },
    iconContainer:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        justifyContent: 'flex-end',
        marginVertical: 0,
        paddingVertical: 0
    },
    tags:{
        flex: 1
    },
    postPreview:{
        flex: 6,
        flexDirection: 'column'
    },
    postImage:{
        flex: 3,
        width: '100%'
    },
    media:{
        flexWrap: 'wrap',
        height: undefined,
        minWidth: width,
        aspectRatio: 1,
        maxHeight:274,
        resizeMode:'contain'
    },
    showDes:{
        padding: 20,
        flex: 1,
        width: '100%',
        backgroundColor: theme.colors.semiTransWhite,
        borderTopLeftRadius: 14,
        borderTopEndRadius: 14,
        position: 'absolute',
        minHeight: 100,
        bottom: 0
        
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray3,
        paddingTop:30,
        alignItems: 'center'
    }
});

const mapStateToProps =(state) => {
    return {
        user: state.firebase.auth
    }
}

export default connect(mapStateToProps, null)(AddPosts)