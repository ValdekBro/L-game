
$('#login-btn').on('click', function() {
    $.post(
        `${HOST}/auth/login`, 
        $('#login').serialize(), 
        'json'
    )
        .done((data) => {
            const { access_token } = data
            Auth.setToken(access_token)
            document.location.href = '/'

        },)
        .fail(function(xhr) {
           const { error, message, statusCode } = xhr.responseJSON

           $('#error-message').text(`Server Error (${error}), status: ${statusCode} - ${message}`)
           const errorToast = document.getElementById('errorToast')
           const toastBootstrap = bootstrap.Toast.getOrCreateInstance(errorToast)
           toastBootstrap
           toastBootstrap.show()
        }); 
});
