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