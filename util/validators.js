module.exports.validateRegisterInput = (
    username, email, password, confirmPassword
) => {
    const errors = {};

    if (username.trim() === '') {errors.username = "Username must not be empty"}

    if (email.trim() === '') {
        errors.email = "Email must not be empty"
    } else {
        const regEx = /^(?:(?:[\w`~!#$%^&*\-=+;:{}'|,?\/]+(?:(?:\.(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)*"|[\w`~!#$%^&*\-=+;:{}'|,?\/]+))*\.[\w`~!#$%^&*\-=+;:{}'|,?\/]+)?)|(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)+"))@(?:[a-zA-Z\d\-]+(?:\.[a-zA-Z\d\-]+)*|\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])$/gm;
        if (!email.match(regEx)) {
            errors.email = 'Email must be a valid email address';
        }
    }

    if (password === '') {
        errors.password = 'Password must not be empty';
    } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords must match';
    }

    return {
        errors, 
        valid: Object.keys(errors).length < 1
    };

};

module.exports.validateLoginInput = (username, password) => {
    const errors = {};
    if (username.trim() === '') { errors.username = 'Username must not be empty' };
    if (password.trim() === '') { errors.password = 'Password must not be empty' };

    return {
        errors,
        valid: Object.keys(errors).length < 1
    };
}