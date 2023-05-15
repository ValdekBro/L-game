class Position {
    playerId = null
    constructor(playerId) {
        this.playerId = playerId
    }
}

class CoinPositionSelection extends Position {
    __typename = CoinPositionSelection.name
    isActive = true

    sourceTile = null
    targetTile = null
    constructor(sourceTile, playerId) {
        super(playerId)
        this.sourceTile = sourceTile
    }

    isValid() {
        if(!this.sourceTile || !this.targetTile) return false
        return this.sourceTile.occupation instanceof Coin && this.targetTile.occupation === null
    }

    render() {
        if(this.sourceTile)
            this.sourceTile.elem.addClass('selected-y')

        if(this.targetTile) {
            if(this.isValid()) 
                this.targetTile.elem.addClass('selected')
            else 
                this.targetTile.elem.addClass('selected-r')
        }
    }

    hide() {
        if(this.sourceTile)
            this.sourceTile.elem.removeClass('selected-y')

        if(this.targetTile) {
            this.targetTile.elem.removeClass('selected')
            this.targetTile.elem.removeClass('selected-r')
        }
    }

    setTarget(tile) {
        this.hide()
        this.targetTile = tile
        this.render()
    }

    finish() {
        this.isActive = false
    }
}

class LPosition extends Position {
    __typename = LPosition.name

    tiles = null
    constructor(tiles, playerId) {
        super(playerId)
        this.tiles = tiles.filter(Boolean)
    }

    isOverloaded() {
        return this.tiles.length > 4;
    }

    isFull() {
        return this.tiles.length >= 4;
    }

    isEmpty() {
        return this.tiles.length === 0
    }

    isFreeSpace() {
        return this.tiles.length >= 0 && this.tiles.length < 4
    }

    isValidShape() {
        const rows = this.tiles.map(tile => tile.row)
        const cols = this.tiles.map(tile => tile.col)
        const rowsU = new Set(rows)
        const colsU = new Set(cols)
        if(rowsU.size === 2 && colsU.size === 3) {

            const count = {}
            rows.map(row => count[row] = (count[row] || 0) + 1)

            if(!Object.values(count).find((c) => c === 3)) return false
            else return true
        } else if(rowsU.size === 3 && colsU.size === 2) {

            const count = {}
            cols.map(col => count[col] = (count[col] || 0) + 1)

            if(!Object.values(count).find((c) => c === 3)) return false
            else return true
        } else {
            return false
        }

    }

    isOutOfBorders() {
        const rows = this.tiles.map(tile => tile.row)
        const cols = this.tiles.map(tile => tile.col)
        return rows.some(row => row < 1 || row > 4) || cols.some(col => col < 1 || col > 4)
    }

    isEqual(lPosition) {
        return this.tiles
            .map((tile, i, tiles) => !!lPosition.tiles.find(t => t.isEqual(tile)))
            .reduce((prev, curr) => prev && curr, true)

    }

    isValid() {
        if(!(this.isFull() && !this.isOverloaded() && !this.isOutOfBorders()))
            return false

        if(!this.isValidShape()) 
            return false

        const validTilesPositions = this.tiles.map(
            tile => {
                if(tile.occupation instanceof Coin) {
                    return false
                } else if(tile.occupation === null) {
                    return true
                } else if(tile.occupation instanceof Player) {
                    const occupant = tile.occupation
                    return occupant.id === this.playerId
                }
            }
        )
        return validTilesPositions.reduce((prev, curr) => prev && curr, true)
    }

    isValidMoveFrom(originLPosition) {
        return this.isValid() && !this.isEqual(originLPosition)
    }

    toggleHint() {
        this.tiles.map(tile => tile.toggleHint())
    }
}

class LPositionSelection extends LPosition {
    __typename = LPositionSelection.name
    isActive = true

    constructor(tiles, playerId) {
        super(tiles, playerId)
        this.render()
    }

    finish() {
        this.isActive = false
    }

    addTile(tile) {
        this.hide()
        this.tiles.push(tile)
        this.render()
    }

    removeTile(tile) {
        const index = this.tiles.findIndex((t => t.isEqual(tile)))
        if(index > -1) {
            this.hide()
            this.tiles.splice(index, 1);
            this.render()
        }
    }

    render() {
        this.tiles.map(tile => {
            if(this.isValid()) 
                tile.elem.addClass('selected')
            else 
                tile.elem.addClass('selected-r')
        })
    }

    hide() {
        this.tiles.map(tile => {
            tile.elem.removeClass('selected')
            tile.elem.removeClass('selected-r')
        })
    }
}

class PositionsFactory {

    constructor(tilesContainer) {
        this.tilesContainer = tilesContainer
    }

    /**
     * 
     * @param {*} headr - head tile row number
     * @param {*} headc - head tile column number
     * @param {*} type  - type of position:
     *  'VB':          'BV':        'VT':         'TV':         'TH':              'BH':          'HT':            'HB':
     *      *               *           * *             * *             *                                   *
     *      *               *           *                 *             * * *           * * *           * * *           * * *
     *      * *           * *           *                 *                             *                                   *
     */
    createLPosition(headr, headc, type, playerId) {
        if(type == 'VB')
            return new LPosition([
                this.tilesContainer.tiles[`${headr}-${headc}`],
                this.tilesContainer.tiles[`${headr}-${headc-1}`],
                this.tilesContainer.tiles[`${headr-1}-${headc-1}`],
                this.tilesContainer.tiles[`${headr-2}-${headc-1}`],
            ], playerId)
        else if(type == 'BV')
            return new LPosition([
                this.tilesContainer.tiles[`${headr}-${headc}`],
                this.tilesContainer.tiles[`${headr}-${headc+1}`],
                this.tilesContainer.tiles[`${headr-1}-${headc+1}`],
                this.tilesContainer.tiles[`${headr-2}-${headc+1}`],
            ], playerId)
        else if(type == 'VT')
            return new LPosition([
                this.tilesContainer.tiles[`${headr}-${headc}`],
                this.tilesContainer.tiles[`${headr}-${headc-1}`],
                this.tilesContainer.tiles[`${headr+1}-${headc-1}`],
                this.tilesContainer.tiles[`${headr+2}-${headc-1}`],
            ], playerId)
        else if(type == 'TV')
            return new LPosition([
                this.tilesContainer.tiles[`${headr}-${headc}`],
                this.tilesContainer.tiles[`${headr}-${headc+1}`],
                this.tilesContainer.tiles[`${headr+1}-${headc+1}`],
                this.tilesContainer.tiles[`${headr+2}-${headc+1}`],
            ], playerId)
        else if(type == 'TH')
            return new LPosition([
                this.tilesContainer.tiles[`${headr}-${headc}`],
                this.tilesContainer.tiles[`${headr+1}-${headc}`],
                this.tilesContainer.tiles[`${headr+1}-${headc+1}`],
                this.tilesContainer.tiles[`${headr+1}-${headc+2}`],
            ], playerId)
        else if(type == 'BH')
            return new LPosition([
                this.tilesContainer.tiles[`${headr}-${headc}`],
                this.tilesContainer.tiles[`${headr-1}-${headc}`],
                this.tilesContainer.tiles[`${headr-1}-${headc+1}`],
                this.tilesContainer.tiles[`${headr-1}-${headc+2}`],
            ], playerId)
        else if(type == 'HT')
            return new LPosition([
                this.tilesContainer.tiles[`${headr}-${headc}`],
                this.tilesContainer.tiles[`${headr+1}-${headc}`],
                this.tilesContainer.tiles[`${headr+1}-${headc-1}`],
                this.tilesContainer.tiles[`${headr+1}-${headc-2}`],
            ], playerId)
        else if(type == 'HB')
            return new LPosition([
                this.tilesContainer.tiles[`${headr}-${headc}`],
                this.tilesContainer.tiles[`${headr-1}-${headc}`],
                this.tilesContainer.tiles[`${headr-1}-${headc-1}`],
                this.tilesContainer.tiles[`${headr-1}-${headc-2}`],
            ], playerId)
        else throw new Error('Invalid position type')
    }

}