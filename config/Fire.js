import firebase from '../config/firebaseCon'
import { v1 as uuid } from 'uuid'

var db = firebase.firestore()

class Fire {

    v1options = {
        node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
        clockseq: 0x1234,
        msecs: new Date().getTime(),
        nsecs: 5678,
      };
    
    constructor(){
        
    }

    get uid() {
        return ( firebase.auth().currentUser || {}).uid
    }

    addPost = async ({type, tags, text, localUri, avatar, username}) => {

        Promise.all(localUri.map(async (uri) => {
           return await this.uploadImageAsync(uri.source)
        })).then( result => {
            new Promise ((res, rej) => {
               db.collection('Posts').add({
                   uid: firebase.auth().currentUser.uid,
                   type,
                   media: result,                                   
                   likes: 0,
                   comments: [],
                   description: text,
                   tags,
                   time: firebase.firestore.FieldValue.serverTimestamp(),
                   postedAt: firebase.firestore.FieldValue.serverTimestamp(),
                   avatar,
                   username
                   
               }).then((ref) => {
                  return res(ref)
               }).catch(err => {
                  return rej(err)
               })
           })
        }).catch(err => console.error(err))
    }


    postMessageImages = async (imageObj) => {

       return Promise.all(imageObj.map(async (img) => {
           return await this.uploadImageAsync(img.uri)
        })).then( result => {
            console.log("UPLOADED NEW IMAG EmESSAHE",result)
           return result
        }).catch(err => console.error(err))
    }

    

     uploadImageAsync =  async (uri) => {
      
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function() {
            resolve(xhr.response);
          };
          xhr.onerror = function(e) {
            reject(new TypeError('Network request failed' , e ));
          };
          xhr.responseType = 'blob';
          xhr.open('GET', uri, true);
          xhr.send(null);
        });
      
        const ref = firebase
          .storage()
          .ref()
          .child(`postsImage/${uuid()}`);
        const snapshot = await ref.put(blob);
        // console.log('uuid: ', uuid())
        // We're done with the blob, close and release it
        blob.close();
      
        return await snapshot.ref.getDownloadURL();
      }

    uploadPhotoAsync = async (uri, dir="photos") =>{
        const path = `${dir}/${this.uid}/${Date.now()}.jpg`

        return new Promise (async(res, rej) => {
            const response = await fetch(uri)
            const file = await response.blob()

            let upload = firebase.storage().ref(path).put(file)

            upload.on("state_changed", snapshot => {

            },
            err=>{
                rej(err)
            },
            async () => {
                const url = await upload.snapshot.ref.getDownloadURL()
                res(url)
            }
            )
        })
    }

    uploadArrayOfImages = async imgArr => {
        const urls = []

       let result = new Promise.all(imgArr.map( async item => {
            const url = []
            const path = `photos/${this.uid}/${Date.now()}${Math.random()*20000000}.jpg`
            const response = await fetch(item)
            const file = await response.blob()
            let upload = firebase.storage().ref(path).put(file)
            upload.on("state_changed", snapshot => {

            },
            err=> {

            },
            async () => {
                url.push(await upload.snapshot.ref.getDownloadURL())
                .then( res(upload.snapshot.ref.getDownloadURL()))
               
            })

        })).then( res => urls.push(res.url) )

        return result
    }

    get timestamp(){
        return (Date.now())
    }

    get firetore(){
        return firebase.firestore()
    }
}

Fire.shared = new Fire()

export default Fire