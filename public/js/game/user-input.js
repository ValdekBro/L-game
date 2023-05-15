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