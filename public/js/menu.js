
const disableLinkButton = (elem) => {
    elem.attr('aria-disabled', "true")
    elem.addClass('disabled')
    elem.removeAttr('href')
} 


const main = async () => {
    const data = await LGameAPI.getUser()
        .catch(e => {
            console.log(e)
            disableLinkButton($('#menu-connect-button'))
            disableLinkButton($('#menu-play-button'))
        })
    $('#nickname').text(`${data.nickname} (${data.rating})`)
}

$(() => { main().catch(e => { throw e }) })

$('#menu-connect-button').on('click', () => {
    (async () => {
        const match = await LGameAPI.findMatch()
        if(!match) {
            document.location.href = '/play'
        } else {
            document.location.href = `/room/${match.socketRoomId}`
        }
    })()
});


