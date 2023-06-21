const main = async () => {
    console.log('OK')
    const user = await LGameAPI.getUser()
    $('#nickname').text(`${user.nickname} (${user.rating})`)

    const matches = await LGameAPI.getStats(user.id)
    matches.filter(match => match.status === 'end').forEach(match => {
        const isWinner = match.winner === user._id
        $('#stats-table').append(`
            <tr>
            <th scope="row">${match.createdAt || ''}</th>
            <td>${match.player1 ? match.player1.nickname : '...'}</td>
            <td>${match.player2 ? match.player2.nickname : '...'}</td>
            <td ${isWinner ? 'class="text-success"' : 'class="text-danger"'}>${match.winnerRatingChange && match.winnerRatingChange > 0 ? (isWinner ? '+' : '-') : ''}${(match.winnerRatingChange) || ''}</td>
            </tr>`)
    })

    const top = await LGameAPI.getTopUsers()
    top.forEach(user => {
        $('#top-players-table').append(`
            <tr>
                <th scope="row">${user.nickname || 'Anonymous'}</th>
                <td>${user.rating}</td>
            </tr>`)
    })
}

$(() => { main().catch(e => { throw e }) })
