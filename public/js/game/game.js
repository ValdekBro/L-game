class TilesContainer {
    elem = null

    tiles = null

    currentSelection = null

    constructor() {
        this.render()
    }

    render() {
        this.elem = createDiv({
            id: 'game-tiles-container'
        })
        this.elem.addClass('game-tiles-container')
    }

    // Layout init
    createLayout() {
        console.log('Creating game layout')
        // For now, only default layout enabled
        this.tiles = {
            // Row 1
            '1-1': new Tile(1, 1, new Coin()),
            '1-2': new Tile(1, 2),
            '1-3': new Tile(1, 3),
            '1-4': new Tile(1, 4),
            
            // Row 2
            '2-1': new Tile(2, 1),
            '2-2': new Tile(2, 2),
            '2-3': new Tile(2, 3),
            '2-4': new Tile(2, 4),
    
            // Row 3
            '3-1': new Tile(3, 1),
            '3-2': new Tile(3, 2),
            '3-3': new Tile(3, 3),
            '3-4': new Tile(3, 4),
    
            // Row 4
            '4-1': new Tile(4, 1),
            '4-2': new Tile(4, 2),
            '4-3': new Tile(4, 3),
            '4-4': new Tile(4, 4, new Coin()),
        }
    }

    clearSelection() {
        this.currentSelection.hide()
        this.currentSelection = null
    }
}

class Game {
    elem = null
    tilesContainer = null

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
                this.finish(this.state.playerId, 'Your opponent has left the game')
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
        const position1 = new LPosition([
            this.tilesContainer.tiles['1-2'],
            this.tilesContainer.tiles['1-3'],
            this.tilesContainer.tiles['2-2'],
            this.tilesContainer.tiles['3-2'],
        ], playerId)
        const position2 = new LPosition([
            this.tilesContainer.tiles['2-3'],
            this.tilesContainer.tiles['3-3'],
            this.tilesContainer.tiles['4-2'],
            this.tilesContainer.tiles['4-3'],
        ], playerId)
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
        }
    }

    changePosition(playerId, position) {
        if(this.state.stage === 1) {
            this.state.removePosition(playerId)
            this.state.applyPosition(playerId, position)
            this.state.nextStage(
                () => this.socket.emit('skip', { roomId: this.roomId, playerId: this.state.playerId })
            )
        } else {
            this.state.moveCoin(playerId, position)
            this.state.nextTurn()
        }

        this.socket.emit('change-position', { roomId: this.roomId, playerId, position })
    }

    skipStage2() {
        this.state.nextTurn()
    }

    // toggleStageHints() {
    //     if(this.state.stage === 1) {
    //         this.state.playersPositions[this.state.turn].toggleHint()
    //     } else {
    //         Object.values(this.tilesContainer.tiles)
    //             .filter(tile => tile.occupation instanceof Coin)
    //             .forEach(tile => tile.elem.toggleHint())
    //     }
    // }

    finish(winnerId, message) {
        this.state.status = 'finished'
        this.socket.disconnect()
        this.tilesContainer.elem.remove()
        const winOrLoseLabel = this.state.playerId === winnerId ? 'You Win!' : 'You Lose :('
        this.state.showMessage(`${winOrLoseLabel} ${message}`)
    }
}

class UserInput {
    static createTilesSelectionListeners(game) {
        Object.values(game.tilesContainer.tiles).map(({ elem }) => {
            elem.mousedown(function() {
                const { r: row, c: col } = $(this).data('pos')
                const tile = game.tilesContainer.tiles[`${row}-${col}`]
                if(game.state.playerId !== game.state.turn)     
                    console.log(game.state.playerId, game.state.turn)
                if(game.state.status === 'started' && game.state.playerId === game.state.turn) {
                    if(game.state.stage === 1) {
                        game.tilesContainer.currentSelection = new LPositionSelection([tile], game.state.turn)
                    } else {
                        if(tile.occupation instanceof Coin)
                            game.tilesContainer.currentSelection = new CoinPositionSelection(tile, game.state.turn)
                    }
                }
            });
            elem.mouseenter(function() {
                const { r: row, c: col } = $(this).data('pos')
                const tile = game.tilesContainer.tiles[`${row}-${col}`]
                if(game.tilesContainer.currentSelection && game.tilesContainer.currentSelection.isActive) {
                    if(game.tilesContainer.currentSelection instanceof LPositionSelection) {
                        if(
                            game.tilesContainer.currentSelection.tiles.length - 2  >= 0 &&
                            tile.isEqual(
                                game.tilesContainer.currentSelection.tiles[
                                    game.tilesContainer.currentSelection.tiles.length - 2
                                ]
                            )
                        ) {
                            game.tilesContainer.currentSelection.removeTile(
                                game.tilesContainer.currentSelection.tiles[
                                    game.tilesContainer.currentSelection.tiles.length - 1
                                ]
                            )
                        } else {
                            if(!game.tilesContainer.currentSelection.isFull()
                                && !(
                                    game.tilesContainer.currentSelection.tiles[
                                        game.tilesContainer.currentSelection.tiles.length - 1
                                    ].row != tile.row
                                    && game.tilesContainer.currentSelection.tiles[
                                        game.tilesContainer.currentSelection.tiles.length - 1
                                    ].col != tile.col
                                ))
                                game.tilesContainer.currentSelection.addTile(tile)
                        }
                    } else if(game.tilesContainer.currentSelection instanceof CoinPositionSelection) {
                        game.tilesContainer.currentSelection.setTarget(tile)
                    }
                    
                }
            });
        })
        game.tilesContainer.elem.mouseleave(function() {
            if(game.tilesContainer.currentSelection) 
                game.tilesContainer.clearSelection()
        });
        game.elem.mouseup(function() {
            if(game.tilesContainer.currentSelection) {
                if(game.tilesContainer.currentSelection.isValid()) {
                    if(game.state.stage === 1) {
                        if(!(
                            game.tilesContainer.currentSelection
                                .isEqual(game.state.playersPositions[game.state.turn])
                        ))
                            game.changePosition(game.state.turn, game.tilesContainer.currentSelection)
                    } else {
                        if(!(
                            game.tilesContainer.currentSelection.targetTile
                                .isEqual(game.tilesContainer.currentSelection.sourceTile)
                        ))
                            game.changePosition(game.state.turn, game.tilesContainer.currentSelection)
                    }
                        
                }

                game.tilesContainer.clearSelection()
            }
        });
    }
    static createSkipStage2ButtonListeners(state, cb) {
        state.message.click(function() {
            state.nextTurn()
            if(cb) cb()
        })
    }
}

$(function() {
    console.log('Loaded')
    const gameElem = $('#game')
    const game = new Game(gameElem)
    game.init()
})

