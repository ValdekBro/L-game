class Tile {
    elem = null

    row = null
    col = null
    key = null

    occupation = null // Player | Coin
    occupationClass = null
    
    constructor(row, col, occupation) {
        this.row = row
        this.col = col
        this.key = `${row}-${col}`

        if(occupation !== undefined)
            this.occupation = occupation

        this.render()
    }

    setOccupation(occupant) {
        this.removeOccupationClass()
        this.occupation = occupant
        this.addOccupationClass()
    }

    render() {
        const attr = {
            id: `tile-${this.row}-${this.col}`
        }

        this.elem = createDiv(attr)

        // const hint = createDiv({})
        // hint.addClass('c')
        // this.elem.append(hint)

        this.elem.data('pos', { r: this.row, c: this.col })
        this.elem.addClass('tile')
        this.elem.addClass('bg-primary')
        // this.elem.text(`${this.row}-${this.col}`)
        this.addOccupationClass()
    }

    addOccupationClass() {
        let label = 'bg-white'

        if(this.occupation === null) {
            label = 'bg-light'
        } else if(this.occupation instanceof Coin) {
            label = 'bg-secondary'
        } else if(this.occupation instanceof Player) {
            const player = this.occupation
            label = player.color
        }

        this.elem.addClass(label)
        this.occupationClass = label
    }
    
    removeOccupationClass() {
        this.elem.removeClass(this.occupationClass)
    }

    isEqual(tile) {
        return this.row === tile.row && this.col === tile.col
    }

    toggleHint() {
        this.elem.toggleClass('hint')
    }
}