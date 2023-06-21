
$('#register-btn').on('click', function() {
    $.post(
        `${HOST}/auth/signup`, 
        $('#register').serialize(), 
        'json'
    )
        .done((data) => {
            console.log(data)
            document.location.href = '/login'
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


