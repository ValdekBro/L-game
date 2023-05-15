class Game {
    elem = null
    tilesContainer = null
    positionsFactory = null

    state = null

    roomId = $('#game-id').text()
    socket = null

    constructor(gameElem) {
        console.log('Creating Game')
        this.elem = gameElem
        this.tilesContainer = new TilesContainer()
        this.render()
        console.log('Game created')
    }

    render() {
        console.log('Rendering game')

        this.elem.addClass('container')
        this.elem.addClass('d-flex')
        this.elem.addClass('flex-column')
        this.elem.addClass('align-items-center')
        
        this.elem.append(this.tilesContainer.elem)

        console.log('Game rendered')
    }


    init() {
        console.log('Initializing game')
        // Init game layout
        this.tilesContainer.createLayout()
        UserInput.createTilesSelectionListeners(this)
        Object.values(this.tilesContainer.tiles).map(tile => this.tilesContainer.elem.append(tile.elem))

        this.positionsFactory = new PositionsFactory(this.tilesContainer)
        console.log('Game layout assigned')

        this.state = new GameState()
        this.elem.prepend(this.state.elem)

        this.socket = io();
        this.socket.connect()

        this.state.showMessage('Connecting...')
        this.state.elem.find('h4').addClass('text-dark')

        this.socket.on("connect", () => {
            this.state.hideMessage()
            this.state.playerId = this.socket.id

            this.socket.on('player-joined', ({ users }) => {
                users.forEach(userId => this.addPlayer(userId))

                if(Object.keys(this.state.players).length < 2) {
                    this.state.showMessage(`Share a page link to invite a player`)
                    this.state.elem.find('h4').addClass('text-dark')
                }
            })

            this.socket.on('leave', ({ room, id }) => {
                console.log('Leave')
                this.checkForWinners()

                if(this.state.isActive())
                    this.finish('Your opponent has left the game')
            })            
    
            this.socket.on('change-position', ({ playerId, position: rawPosition }) => {
                if(playerId != this.state.playerId) {
                    console.log('Recived update')
                    if(rawPosition.__typename === LPositionSelection.name) {
                        const position = new LPositionSelection(
                            rawPosition.tiles.map(tile => this.tilesContainer.tiles[tile.key]),
                            playerId
                        )
                        this.updatePosition(playerId, position)
                    } else if(rawPosition.__typename === CoinPositionSelection.name) {
                        const position = new CoinPositionSelection(
                            this.tilesContainer.tiles[rawPosition.sourceTile.key],
                            playerId
                        )
                        position.targetTile = this.tilesContainer.tiles[rawPosition.targetTile.key]
                        this.updatePosition(playerId, position)
                    }
                }
            })

            this.socket.on('skip', ({ playerId, position: rawPosition }) => {
                if(playerId != this.state.playerId) {
                    console.log('Recived skip')
                    this.skipStage2()
                }
            })
        
            this.socket.emit('join-room', { roomId: this.roomId });
        
            console.log('Game initialized')
        });
    }

    start() {
        this.state.hideMessage()
        this.state.start()
        this.state.elem.addClass(this.state.players[this.state.turn].color)
    }

    createPlayerInitialPosition(playerId) {
        // For testing
        const position1 = this.positionsFactory.createLPosition(2, 4, 'HB', playerId)
        const position2 = this.positionsFactory.createLPosition(4, 1, 'BH', playerId)

        // const position1 = this.positionsFactory.createLPosition(1, 3, 'VT', playerId)
        // const position2 = this.positionsFactory.createLPosition(4, 2, 'BV', playerId)
        if(position1.isValid())
            return position1
        else
            return position2
    }

    addPlayer(playerId) {
        if(!Object.keys(this.state.players).find(id => id === playerId)) {
            this.state.addPlayer(playerId)

            const initialPosition = this.createPlayerInitialPosition(playerId)
            this.state.applyPosition(playerId, initialPosition)

            if(Object.values(this.state.players).length >= 2)
                this.start()
        }
    }

    updatePosition(playerId, position) {
        if(this.state.stage === 1) {
            this.state.removePosition(playerId)
            this.state.applyPosition(playerId, position)
            setTimeout(() => position.hide(), 1000)
            this.state.nextStage(
                () => this.socket.emit('skip', { roomId: this.roomId, playerId: this.state.playerId })
            )
        } else {
            this.state.moveCoin(playerId, position)
            setTimeout(() => position.hide(), 1000)
            this.state.nextTurn()

            this.checkForWinners()
        }
    }

    changePosition(playerId, position) {
        if(this.state.stage === 1) {
            this.state.removePosition(playerId)
            this.state.applyPosition(playerId, position)
            this.state.nextStage(
                () => {
                    this.socket.emit('skip', { roomId: this.roomId, playerId: this.state.playerId })
                    this.checkForWinners()
                }
            )
        } else {
            this.state.moveCoin(playerId, position)
            this.state.nextTurn()

            this.checkForWinners()
        }

        this.socket.emit('change-position', { roomId: this.roomId, playerId, position })
    }

    skipStage2() {
        this.state.nextTurn()
    }

    checkForWinners() {
        const playersWithAvailableMoves = Object.keys(this.state.players).filter(playerId => this.hasAvailableMoves(playerId))
        console.log("Players with available moves: ", playersWithAvailableMoves)
        if(playersWithAvailableMoves.length < 2) {
            const winner = playersWithAvailableMoves[0]
            if(winner == this.state.playerId)
                this.finish('You won!')
            else
                this.finish('You lost :(')
        }
    }
    hasAvailableMoves(playerId) {
        const variants = ['BV', 'TV', 'VB', 'VT', 'BH', 'TH', 'HB', 'HT']
        return Object.values(this.tilesContainer.tiles).some(
            tile => variants.some(
                variant => this.positionsFactory
                    .createLPosition(tile.row, tile.col, variant, playerId)
                    .isValidMoveFrom(this.state.playersPositions[playerId])
            )
        )
    }

    finish(message) {
        this.socket.disconnect()
        // this.tilesContainer.elem.remove()
        this.state.showMessage(message)
        this.state.finish()
    }
}

$(function() {
    console.log('Loaded')
    const gameElem = $('#game')
    const game = new Game(gameElem)
    game.init()
})

