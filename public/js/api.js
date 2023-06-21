
class Auth {
    static getToken() {
        if(!localStorage.getItem("token"))
            document.location.href = '/login'
        else
            Auth.enableLogout()
        return localStorage.getItem("token")
    }

    static setToken(token) {
        localStorage.setItem("token", token)
        Auth.enableLogout()
    }

    static rejectToken() {
        localStorage.setItem("token", null)
        $('#login-nav-btn').text('Login')
    }

    static enableLogout() {
        $('#login-nav-btn').text('Logout').on('click', e => {
            e.preventDefault()
            Auth.rejectToken()
            document.location.href = '/login'
        })
    }
}

class LGameAPI {
    static handleError(xhr) {
        const { error, message, statusCode } = xhr.responseJSON
                    
        if(statusCode == 401) {
            Auth.rejectToken();
        } else {
            $('#error-message').text(`Server Error (${error}), status: ${statusCode} - ${message}`)
            const errorToast = document.getElementById('errorToast')
            if(errorToast) {
                const toastBootstrap = bootstrap.Toast.getOrCreateInstance(errorToast)
                toastBootstrap
                toastBootstrap.show()
            } else {
                console.log(xhr.responseJSON)
            }
        }
    }

    static async get(path, errorCb) {
        return new Promise((res, rej) => {
            $.ajax({
                type: "GET",
                beforeSend: function(request) {
                  request.setRequestHeader("Authorization", 'Bearer ' + Auth.getToken());
                },
                url: `${HOST}${path}`,
                processData: false,
                success: res,
                error: errorCb //xhr => { LGameAPI.handleError(xhr); rej(xhr.responseJSON.message) }
            });
        })
    }
    static async post(path, data) {

    }

    static async getUser() {
        return new Promise((res, rej) => {
            $.ajax({
                type: "GET",
                beforeSend: function(request) {
                  request.setRequestHeader("Authorization", 'Bearer ' + Auth.getToken());
                },
                url: `${HOST}/users/me`,
                processData: false,
                success: res,
                error: xhr => { LGameAPI.handleError(xhr); rej(xhr.responseJSON.message) }
            });
        })
    }
    
    static async findMatch() {
        return new Promise((res, rej) => {
            $.ajax({
                type: "GET",
                beforeSend: function(request) {
                  request.setRequestHeader("Authorization", 'Bearer ' + Auth.getToken());
                },
                url: `${HOST}/match/random`,
                processData: false,
                success: res,
                error: xhr => LGameAPI.handleError(xhr)
            });
        })
    }
    

    static async joinMatch(roomId) {
        return new Promise((res, rej) => {
            $.ajax({
                type: "POST",
                data: JSON.stringify({ roomId }),
                contentType: 'application/json',
                beforeSend: function(request) {
                  request.setRequestHeader("Authorization", 'Bearer ' + Auth.getToken());
                },
                url: `${HOST}/match/join`,
                processData: true,
                success: res,
                error: xhr => LGameAPI.handleError(xhr)
            });
        })
    }

    static async finishMatch(roomId) {
        return new Promise((res, rej) => {
            $.ajax({
                type: "POST",
                data: JSON.stringify({ roomId }),
                contentType: 'application/json',
                beforeSend: function(request) {
                  request.setRequestHeader("Authorization", 'Bearer ' + Auth.getToken());
                },
                url: `${HOST}/match/finish`,
                processData: true,
                success: res,
                error: xhr => LGameAPI.handleError(xhr)
            });
        })
    }

    static async getStats(userId) {
        return new Promise((res, rej) => {
            $.ajax({
                type: "GET",
                beforeSend: function(request) {
                  request.setRequestHeader("Authorization", 'Bearer ' + Auth.getToken());
                },
                url: `${HOST}/match`,
                processData: false,
                success: res,
                error: xhr => LGameAPI.handleError(xhr)
            });
        })
    }

    static async getTopUsers() {
        return new Promise((res, rej) => {
            $.ajax({
                type: "GET",
                beforeSend: function(request) {
                  request.setRequestHeader("Authorization", 'Bearer ' + Auth.getToken());
                },
                url: `${HOST}/users/top`,
                processData: false,
                success: res,
                error: xhr => LGameAPI.handleError(xhr)
            });
        })
    }
}