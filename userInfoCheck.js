function check_password(password) {
    return /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        password.length > 4;
}

function check_email(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function check_tel(tel) {
    var i, j, strTemp;

    strTemp = "0123456789-()# ";

    for (i = 0; i < tel.length; i++) {

        j = strTemp.indexOf(tel.charAt(i));

        if (j == -1) {
            //說明有字元不合法
            return 0;
        }

    }
    //說明合法    
    return 1;
}

module.exports.check_password = check_password;
module.exports.check_email = check_email;
module.exports.check_tel = check_tel;