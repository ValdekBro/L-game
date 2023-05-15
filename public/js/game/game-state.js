class GameState {
    elem = null
    skipElem = null

    players = {}
    playersPositions = {}

    playerId = null

    status = 'pending' // 'pending' | 'started' | 'end'
    turn = null // playerId
    stage = null // 1 | 2

    availablePlayersColors = null

    constructor() {
        this.availablePlayersColors = ['bg-warning', 'bg-info']
        this.render()
    }

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
    nextStage(onSkip) {
        this.stage = 2
        
        this.skipElem = createH4({
            id: 'skip-button'
        })
        
        if(this.turn === this.playerId) {
            this.skipElem.text('Skip')
            this.skipElem.addClass('pt-2')
            UserInput.createSkipStage2ButtonListeners(this, onSkip)
            this.elem.append(this.skipElem)
        }
    }
    nextTurn() {
        const playersIds = Object.values(this.players).map(({ id }) => id)
        
        if(playersIds.indexOf(this.turn) === 0) this.setTurn(playersIds[1])
        else this.setTurn(playersIds[0])
        this.stage = 1

        if(this.skipElem) {
            this.skipElem.remove()
            this.skipElem = null
        }

        this.updateWaitLabel()

        Object.values(this.players).map(({ color }) => this.elem.toggleClass(color))
    }

    updateWaitLabel() {
        if(this.turn !== this.playerId) {
            this.waitElem = createH4({
                id: 'wait-label'
            })
            this.waitElem.text('Wait for the opponent\'s move')
            this.waitElem.addClass('pt-2')
            this.elem.append(this.waitElem)
        } else {
            if(this.waitElem) {
                this.waitElem.remove()
                this.waitElem = null
            }
        }
    }

    showMessage(message) {
        this.hideMessages()
        
        const elem = createH4({})
        elem.text(message)
        elem.addClass('pt-2')
        this.elem.append(elem)
    }

    hideMessages(message) {
        if(this.skipElem) {
            this.skipElem.remove()
            this.skipElem = null
        }
        if(this.waitElem) {
            this.waitElem.remove()
            this.waitElem = null
        }
        this.elem.empty()
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