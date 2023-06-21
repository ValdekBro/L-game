class GameState {
    elem = null

    players = {}
    playersPositions = {}

    playerId = null

    status = 'pending' // 'pending' | 'started' | 'end'
    turn = null // playerId
    stage = null // 1 | 2

    availablePlayersColors = null

    constructor() {
        this.availablePlayersColors = ['bg-primary', 'bg-danger']
        this.render()
    }

    isActive() { return this.status == 'started' }
    isYourTurn() { return this.playerId == this.turn }

    render() {
        this.elem = createDiv({ 
            id: 'game-state'
        })
        this.elem.addClass('game-state')
        this.elem.addClass('d-flex')
        this.elem.addClass('text-white')
        this.elem.addClass('justify-content-center')
        this.elem.addClass('mb-4')
        this.elem.addClass('container-fluid')
    }
    

    start() {
        this.status = 'started'
        this.setTurn(Object.values(this.players)[0].id)
        this.stage = 1
        
        this.updateWaitLabel()
        console.log('Game started')
    }

    finish() {
        this.status = 'end'
        console.log('Game finished')
    }

    setTurn(id) {
        this.turn = id
        console.log(`Next turn for Player${id}`)
    }
    nextStage(onSkip, onSecondStage) {
        this.stage = 2
        
        if(this.turn === this.playerId) {
            this.showButton('Skip', () => {
                this.nextTurn()
                if(onSkip) onSkip()
            })
        }
    }
    nextTurn() {
        const playersIds = Object.values(this.players).map(({ id }) => id)
        
        if(playersIds.indexOf(this.turn) === 0) this.setTurn(playersIds[1])
        else this.setTurn(playersIds[0])
        this.stage = 1

        this.updateWaitLabel()

        Object.values(this.players).map(({ color }) => this.elem.toggleClass(color))
    }

    updateWaitLabel() {
        if(this.turn !== this.playerId) 
            this.showMessage('Wait for the opponent\'s move')
        else 
            this.showMessage('Make a move')
    }


    hideMessage() {
        if(this.message) {
            this.message.popover('hide')
            this.message.remove()
            this.message = null
        }
        this.elem.empty()
    }

    updateMessage(elem, message) {
        this.hideMessage()
        
        this.message = elem
        this.message.text(message)
        this.message.addClass('mt-2')
        // this.message.addClass('text-dark')
        this.elem.append(this.message)
    }

    showButton(message, onClick) {
        this.updateMessage(
            createClickableH4({}, onClick),
            message
        )
    }
    showPopupButton(message, popupContent, onClick) {
        this.updateMessage(
            createClickablePopover({}, popupContent, onClick)
                .addClass('h5'),
            message
        )
    }
    showMessage(message) {
        this.updateMessage(
            createH4({}),
            message
        )
    }

    addPlayer(playerId) {
        console.log(`Adding  player <${playerId}>`)
        if(Object.values(this.players).length >= 2) {
            throw new Error('A maximum of 2 players can participate in the game')
        }

        const playerColor = this.availablePlayersColors.pop()
        if(!playerColor) 
            throw new Error('The Game has no available player colors left')

        console.log(`Creating player <${playerId}>`)
        const player = new Player(playerId, playerColor)
        this.players[player.id] = player
        
        console.log('Player added')
    }

    applyPosition(playerId, position) {
        const player = this.players[playerId]
        position.tiles.map(tile => tile.setOccupation(player))
        this.playersPositions[player.id] = position
    }

    removePosition(playerId) {
        const position = this.playersPositions[playerId]
        position.tiles.map(tile => tile.setOccupation(null))
        this.playersPositions[playerId] = null
    }

    moveCoin(playerId, position) {
        const coin = position.sourceTile.occupation
        position.sourceTile.setOccupation(null)
        position.targetTile.setOccupation(coin)
    }
}