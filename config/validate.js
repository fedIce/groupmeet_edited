export function isEmpty(str) {
    return (!str || 0 === str.length);
}

export function validateEmail(email) {
    let filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    return filter.test(email);
}

export function validatePassword(password) {
    return (password.length > 6);
}

export function confirmPassword(c_password, password) {
    return (c_password === password);
}

export function validate2(form) {
    let error = {};
    let success = true;

    let keys = Object.keys(form);
    let length = keys.length;

    keys.slice(0, length).map(field => {
        if (field !== "error"){
            let { type, value } = form[field];
            if (isEmpty(value)){
                error[field] = 'Your ' + field + ' is required';
                success = false;
            }else{
                error[field] = '';

                if (type === "email" && !validateEmail(value)) {
                    error[field] = 'Enter a valid email address';
                    success = false;
                }else if (type === "password" && !validatePassword(value)) {
                    error[field] = 'Password must be at least 6 characters';
                    success = false;
                }else if (type === "confirm_password" && !confirmPassword(value, form["password"]['value'])) {
                    error[field] = 'Password does not match.';
                    success = false;
                }
            }
        }
    });

    return {success, error};
}

export function validate(data, type, confrimPass ) {
   
    let errors = []
    let success = true;

    if (type === "email" && !validateEmail(data) && !(data === 'contact@email.com')) {
        errors[0] = { type:'email', msg: 'Enter a valid email address' }
        success = false;
    }else if (type === "password" && !validatePassword(data) ) {
        errors[1] = { type: 'password', msg: 'Password must be at least 6 characters' }
        success = false;
    }
    else if (type === "confirm_password" && !confirmPassword(data, confrimPass)) {
        errors[2] = { type: 'confirm_password', msg: 'Password does not match.' }
        success = false;

    }

    return {success, errors};
        
};

export const extractUser = (arr, id) => {
    for(var i in arr){
        if(i == id ){
            return arr[i]
        }
    }
}

export const UserLikedPost = (arr, uid, postId) => {
    var d;
    Object.values(arr).map(i => {
        // if(i.post.postId == postId){
            // console.log("DIMENSION 1 : ", i.post)

        // }
       d = i.post.filter(obj => (obj.likerId == uid))
    })
        console.log("DIMENSION 2 : ", d)
        console.log("==================================================")

    if(d.length > 0){
        return false
    }else{
        return false
    }
    
}

export function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}