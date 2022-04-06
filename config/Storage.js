import { AsyncStorage } from 'react-native';
import Reactotron from 'reactotron-react-native'
import { Asset } from 'expo-asset';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import Builder, { DB } from 'crane-query-builder'; // Import the library

import firebase from '../config/firebaseCon'

var Firedb = firebase.firestore()


var db;



class Store{
    constructor(){
        this.initDB()       
    }

    initDB = async () => {

        await this.createTable() 
        await this.createGroupChatTable() 
        await this.createActiveChatsList()
        await this.createFileTempCache()
        // await this.dropTable('OneOnOneChats')
        // await this.dropTable('GroupChat')
        // await this.dropTable('ChatList')

        await this.testDriver();
        await this.loadDB();
        let num = await Builder()
        .table('OneOnOneChats')
        .count()

        let Group_num = await Builder()
        .table('GroupChat')
        .count()

        let list_num = await Builder()
        .table('ChatList')
        .count()

        console.log(`The Table contains ${num} Rows`)
        // console.log(`The Group Chat contains ${Group_num} Rows`)
        console.log(`The Chat List contains ${list_num} Rows`)
      }

      dropTable = async (table) => {
          const db = SQLite.openDatabase('My.db')

          try{
              await db.transaction(
                tx => {
                    tx.executeSql(`drop table ${table}`), [],
                    (tx, results) => {
                        if (results && results.rows && results.rows._array) {
                           
                            console.log('table dropped')
                          } else {
                            console.log('no results')
                          }
                    },
                    (tx, error) => {
                        console.log(error);
                      }
                }
              )
          }catch (error) {
            console.log(error);
          }
      }

      dropCacheTable = async (table) => {
        const db = SQLite.openDatabase('My.db')

        try{
            await db.transaction(
              tx => {
                  tx.executeSql(`drop table ${table}`), [],
                  (tx, results) => {
                      if (results && results.rows && results.rows._array) {
                         
                          console.log('table dropped')
                          
                        } else {
                          console.log('no results')
                        }
                  },
                  (tx, error) => {
                      console.log(error);
                    }
              }
            )
        }catch (error) {
          console.log(error);
        }
    }

      

      createFileTempCache = async () => {
        try{

            let db = SQLite.openDatabase('My.db')

            await db.transaction(
                tx => {
                    tx.executeSql( 
                        `create table if not exists TempFileCache (id integer primary key not null, uri text, _index integer);` ,[],
                    (tx, results) => {
                        if (results && results.rows && results.rows._array) {
                           
                          } else {
                            console.log(' Cant create table ')
                          }
                    },
                    (tx, error) => {
                        console.log(error);
                      }
                    )}
            )

        }catch (error) {
            console.log(error);
        }
      }

      CacheFileForUpload = async (data) => {

        // await this.dropTable("TempFileCache")

            await this.createFileTempCache()

            const table = await Builder()
            .table("TempFileCache")
            .insert({
                uri: data.uri,
                _index: data.index
            })
            .then(async ()=>{
                const count = await Builder()
                .table("TempFileCache")
                .count()
                console.log(`Cached ${count} Files`)
            })
            .catch( err => console.log(err))
      }


      createTable = async () => {
        try{

            let db = SQLite.openDatabase('My.db')

            await db.transaction(
                tx => {
                    tx.executeSql( 
                        `create table if not exists OneOnOneChats (id integer primary key not null, senderName text, type text, status text, sender text, replyMode text, receiver text, msgID text,message text, time text, conversationID text, imgArr text, avatar text, postType text);` ,[],
                    (tx, results) => {
                        if (results && results.rows && results.rows._array) {
                            /* do something with the items */
                            // results.rows._array holds all the results.
                            // console.log(JSON.stringify(results.rows._array));
                            // console.log('table created')
                          } else {
                            console.log(' Cant create table ')
                          }
                    },
                    (tx, error) => {
                        console.log(error);
                      }
                    )}
            )

        }catch (error) {
            console.log(error);
        }
      }

      createGroupChatTable = async () => {
        try{

            let db = SQLite.openDatabase('My.db')

            await db.transaction(
                tx => {
                    tx.executeSql( 
                        `create table if not exists GroupChat (id integer primary key not null, type text, status text, sender text, msgID text,message text, time text, conversationID text, imgArr text, name text, avatar text);` ,[],
                    (tx, results) => {
                        if (results && results.rows && results.rows._array) {
                            /* do something with the items */
                            // results.rows._array holds all the results.
                            // console.log(JSON.stringify(results.rows._array));
                            // console.log('table created')
                          } else {
                            console.log(' Cant create table ')
                          }
                    },
                    (tx, error) => {
                        console.log(error);
                      }
                    )}
            )

        }catch (error) {
            console.log(error);
        }
      }

      _clearGroupChat = async (id) => {
        await Builder()
        .table('GroupChat')
        .where('conversationID', '==', id)
        .delete()
      }

     testDriver = async () => {
        const dummy = SQLite.openDatabase('dummy.db');
      
        try {
          await dummy.transaction(tx => tx.executeSql(''));
        } catch (e) {
          if (this.state.debugEnabled)
              console.log('error while executing SQL in dummy DB');
        }
      }
      
     loadDB = async () => {
        let dbFile = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}SQLite/My.db`);
      
        if (!dbFile.exists)
           console.log("My.db does not exist")
      
        // Add connection using DB.addConnection
        DB.addConnection({
          type: 'expo',
          driver: SQLite,
          name: 'My.db',
        });

        console.log("DB Loaded")

      }


    _encryptStorage = async () => {
        //Ecrypt Data
        
    }


    _decryptStorage = async () => {
        //Derypt Data
        
    }


    loadChats = async (table) => {
        try {
            let chats = await Builder() 
                        .table(table)
                        .get()


                // console.log("Chats retrieved: ", chats)
        }catch (e) {
            console.log("Error fetching chats", e)
        }
    }

    _storeOneOnOneChats_Local = async ( chatData ) => {

        if( chatData == null || chatData == undefined ){
            return false
        }


        try{ 

            let chatArr = await this.loadChats('OneOnOneChats')


           let writeMsg =  await Builder() 
            .table('OneOnOneChats')
            .insert({
                conversationID: chatData.conversationID,
                sender: chatData.sender,
                receiver: chatData.receiver,
                avatar:chatData.senderAvatar,
                type: chatData.type,
                senderName: chatData.senderName,
                status: chatData.status,
                msgID: chatData.id,
                message: chatData.message,
                time: chatData.time.toString(),
                imgArr: chatData.imgArr,
                replyMode: chatData.replyMode? chatData.replyMode: JSON.stringify(false),
                postType: chatData.postType? chatData.postType: null
            }).then(res => {
                console.log("Inserted Successfully", JSON.stringify(res))
            }).catch(err => console.log("Failed Top Insert because: ", err))
        
            return chatArr

        }catch (e) {
            console.log(e)
        }

    }

    _storeGroupChats_Local = async ( chatData ) => {

        if( chatData == null || chatData == undefined ){
            return false
        }


        try{ 

            let chatArr = await this.loadChats('GroupChat')


           let writeMsg =  await Builder() 
            .table('GroupChat')
            .insert({
                conversationID: chatData.conversationID,
                sender: chatData.sender,
                type: chatData.type,
                status: chatData.status,
                msgID: chatData.id,
                message: chatData.message,
                time: chatData.time.toString(),
                imgArr: chatData.imgArr,
                name: chatData.name,
                avatar: chatData.avatar
            }).then(res => {
                console.log("Inserted Successfully", JSON.stringify(res))
            }).catch(err => console.log("Failed Top Insert because: ", err))
        
            return chatArr

        }catch (e) {
            console.log(e)
        }

    }

    _storeObjData = async (key, data, Ref ) => {
        try {
          await AsyncStorage.setItem( key, data).then(() => {
            
             key != null && Ref != null? this._storeCoversationKeys(Ref, key): null
          });

        } catch (error) {
            Reactotron.log(error)
          // Error saving data
        }
      };

    _storeCoversationKeys =  async (key, msgKey ) => {

        try{

            const VaultKeys =  await AsyncStorage.getItem(key)

            var temp = []
            
            if(VaultKeys != null){ 

                var savedKeys = JSON.parse(VaultKeys)

                if(Array.isArray(savedKeys)){
                    
                    temp = savedKeys
                    temp.push(msgKey)

                }else{
                    temp = [savedKeys, msgKey]
                }

                var getKeys = new Set(temp)
                getKeys = [...getKeys.values()]
                
                Reactotron.log({
                    VaultKeys,
                    getKeys,
                    key,
                    msgKey
                })

                    await AsyncStorage.setItem(key, JSON.stringify(getKeys)).catch(err => console.log("Key Storage Error", err))
                }else{



                await AsyncStorage.setItem(key, JSON.stringify(msgKey)).catch(err => console.log("Key Storage Error", err))
                }

            //    AsyncStorage.clear()

        
        }catch (error){
            //Some ERROR
            console.log(" Error :", error);
        }
    }

    _retrieveMsgKeys = async (conversationKey) => {
    try {
        const value = await AsyncStorage.getItem(conversationKey).then(value => {
            if (value !== null) {
            // We have data!!
            return value
            }
        });

        return value

    } catch (error) {
        // Error retrieving data
        console.log(" Error getting conversation Keys:", error);
    }
    };

    _retrieveConversation = (conversationKey) => {
    
        const conv = new Promise(async (res, rej) => {

            try {
                return this._retrieveMsgKeys(conversationKey).then( async keyMap => {
    
                    if(Array.isArray(JSON.parse(keyMap))){
                        if( keyMap != undefined || keyMap != null ){
                            AsyncStorage.multiGet(JSON.parse(keyMap), async (error, stores ) => {
                            const dat = stores.map((result, i, store) => {
                                let key = store[i][0];
                                let val = store[i][1];
                                return result
                            })
    
                            await Promise.all(dat).then( messages  => {
                                // Reactotron.log("LOG MESSAGES", messages)
                                res(messages)
                            })
    
                        })
    
                        }
    
                    }
        
                })
    
    
    
                }catch (error){
                    rej(error)
                }
            })

            return conv

        }






        createActiveChatsList = async () => {
            try{
    
                let db = SQLite.openDatabase('My.db')
    
                await db.transaction(
                    tx => {
                        tx.executeSql( 
                            `create table if not exists ChatList (id integer primary key not null, last_message text, lastMessage_time text, senderId text,senderName text, senderAvatar text, count integer );` ,[],
                        (tx, results) => {
                            if (results && results.rows && results.rows._array) {
                                /* do something with the items */
                                // results.rows._array holds all the results.
                                // console.log(JSON.stringify(results.rows._array));
                                // console.log('table created')
                              } else {
                                console.log(' Cant create table ')
                              }
                        },
                        (tx, error) => {
                            console.log(error);
                          }
                        )}
                )
    
            }catch (error) {
                console.log(error);
            }
          }


          _updateChatList = async ( chatData ) => {


            if( chatData == null || chatData == undefined ){
                return false
            }
    
    
            try{ 

                const checkIfExist = await Builder()
                .table('ChatList')
                .where('senderId', chatData.senderId)
                .count().catch(err => {
                    console.log("Error: ",err)
                })

                if(checkIfExist > 0){
                    console.log("Chat data Not empty: ", chatData)

                     await Builder() 
                    .table('ChatList')
                    .updateOrInsert({
                        senderId: chatData.senderId,
                    },
                    {
                        last_message: chatData.last_message, 
                        lastMessage_time: new Date().toString() ,
                        count: chatData.count? chatData.count : 0
                    }).then(res => {
                        console.log("Updated ChatList Successfully", res)
                    }) 
                }else{

                    if(chatData.initial == true){

                        const Temp = []

                        const AsynStore = await AsyncStorage.getItem("TempNewMsg")

                        if(AsynStore != null){


                              

                                if(Array.isArray(JSON.parse(AsynStore))){
                                   
                                    const hasItem = JSON.parse(AsynStore).filter( (member) => member.senderId == chatData.senderId ).length > 0 
                                            
                                        
                                        
                                        
                                        if(!hasItem){
                                            

                                        Temp.push({
                                            last_message: chatData.last_message, 
                                            lastMessage_time: chatData.time? chatData.time : new Date().toString() ,
                                            senderId: chatData.senderId,
                                            senderName: chatData.senderName , 
                                            senderAvatar: chatData.senderAvatar,
                                            count: chatData.count? chatData.count : 0
                                        })
                                    }

                                AsyncStorage.setItem("TempNewMsg",JSON.stringify(Temp)).then((th) => {
                                    console.log("Done: ",Temp)
                                })
                            }
                    }

                    }
                   



                    await Builder() 
                    .table('ChatList')
                    .updateOrInsert({
                        senderId: chatData.senderId,
                    },{
                        last_message: chatData.last_message, 
                        lastMessage_time: chatData.time? chatData.time : new Date().toString() ,
                        senderId: chatData.senderId,
                        senderName: chatData.senderName , 
                        senderAvatar: chatData.senderAvatar,
                        count: chatData.count? chatData.count : 0
                    }).then(res => {
                        console.log("Updated ChatList Successfully", res)
                    }).catch(err => console.log("Failed Top Insert because: ", err))
                    console.log("Chat data Empty ENd:  ", chatData)
                }

                
    
            }catch (e) {
                console.log(e)
            }
    
        }


        _MarkRead = async ( chatData ) => {


            if( chatData == null || chatData == undefined ){
                return false
            }

            const inAsync = await AsyncStorage.getItem("TempNewMsg")
            const temp = []


            if(inAsync != null){
                JSON.parse(inAsync).map( item => {
                    if(item.senderId != chatData.senderId){
                        temp.push(item)
                    }
                })


                await AsyncStorage.setItem("TempNewMsg",JSON.stringify(temp))
            }

            await  AsyncStorage.setItem("NewMsg",JSON.stringify([]))
    
            
    
            try{ 

                const checkIfExist = await Builder()
                .table('ChatList')
                .where('senderId', chatData.senderId)
                .count()

                if(checkIfExist > 0){

                    const checkIfExist = await Builder()
                    .table('ChatList')
                    .updateOrInsert({
                        senderId: chatData.senderId
                    },{
                        count: 0
                    })
                }else{
                    return false
                }

             }catch(e) {
                console.log(e)
            }
        }

        chatLogExists = async (sender) =>{
            let customersA = await Builder()
                .table('ChatList')
                .where('senderId', sender)
                .exists()

            console.log("Custiner in log stats is: ",customersA)

            return customersA
        }

    
        }

Store.store = new Store()

export default Store