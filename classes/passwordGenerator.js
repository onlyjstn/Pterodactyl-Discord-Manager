
class Password {
    /**
     * Generates secure passwords
     */
    constructor() {
        this.generatePassword = async function (length) {

            let password

            let characterSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for(let i = 0; i < length; i++) {
                password += characterSet.charAt(Math.floor(Math.random() * characterSet.length))
            }

            return password
        }
    }
}

module.exports = {
    Password
}