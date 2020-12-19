const MineSweep = {
  canvas: null,
  ctx: null,
  map: null,
  rows: 30,
  cols: 50,
  mineCount: 100,
  status: -1,

  load () {
    const canvas = document.createElement('canvas')
    const width = window.innerWidth
    const height = window.innerHeight
    
    canvas.width = width
    canvas.height = height
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    
    hidpi(canvas)
    const ctx = canvas.getContext('2d')
    this.canvas = canvas
    this.ctx = ctx

    const levelSelect = document.createElement('select')
    levelSelect.style.position = 'fixed'
    levelSelect.style.right = '20px'
    levelSelect.style.top = '20px'
    levelSelect.style.height = '24px'
    levelSelect.style.lineHeight = '24px'
    levelSelect.style.borderRadius = '3px'
    levelSelect.style.borderColor = '#000'
    levelSelect.style.padding = '0 10px'
    levelSelect.style.background = 'transparent'

    const options = [
      { lv: 1, label: 'Easy' },
      { lv: 2, label: 'Normal' },
      { lv: 3, label: 'Hard' }
    ]
    options.forEach(o => {
      const option = document.createElement('option')
      option.value = o.lv
      option.innerHTML = o.label
      levelSelect.appendChild(option)
    })

    levelSelect.onchange = () => this.start(+levelSelect.value)

    document.body.appendChild(canvas)
    document.body.appendChild(levelSelect)
    canvas.addEventListener('click', this.onclick.bind(this))
  },

  start (level) {
    this.status = 0
    switch (level) {
      case 1:
        this.rows = 10
        this.cols = 10
        this.mineCount = 20
        break;
      case 2:
        this.rows = 20
        this.cols = 30
        this.mineCount = 100
        break;
      case 3:
        this.rows = 30
        this.cols = 50
        this.mineCount = 300
    }

    this.initMap()
    this.render()
  },

  initMap () {
    this.map = new Array(this.rows)
    for (let r = 0; r < this.rows; r++) {
      this.map[r] = new Array(this.cols)
      this.map[r].fill(0)
    }
  },

  initMine (rowIndex, columnIndex) {
    const randomRowIndex = () => Math.floor(Math.random() * this.rows)
    const randomCollumnIndex = () => Math.floor(Math.random() * this.cols)

    // 生成雷
    const randomRC = () => {
      let r = randomRowIndex(), c = randomCollumnIndex()
      let dr = Math.abs(r - rowIndex)
      let dc = Math.abs(c - columnIndex)
      while (this.map[r][c] === 9 || (dr <= 1 && dc <= 1)) {
        r = randomRowIndex()
        c = randomCollumnIndex()
        dr = Math.abs(r - rowIndex)
        dc = Math.abs(c - columnIndex)
      }

      return { r, c }
    }

    for (let i = 0; i < this.mineCount; i++) {
      const { r, c } = randomRC()
      this.map[r][c] = 9
    }

    // 更新数字
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.map[r][c] === 9) continue

        let n = 0;
        if (r > 0 && c > 0 && this.map[r - 1][c - 1] === 9) n++
        if (r > 0 && this.map[r - 1][c] === 9) n++
        if (r > 0 && c < this.cols - 1 && this.map[r - 1][c + 1] === 9) n++

        if (c > 0 && this.map[r][c - 1] === 9) n++
        if (c < this.cols - 1 && this.map[r][c + 1] === 9) n++

        if (r < this.rows - 1 && c > 0 && this.map[r + 1][c - 1] === 9) n++
        if (r < this.rows - 1 && this.map[r + 1][c] === 9) n++
        if (r < this.rows - 1 && c < this.cols - 1 && this.map[r + 1][c + 1] === 9) n++

        this.map[r][c] = n
      }
    }
  },

  render () {
    const cw = window.innerWidth - 100
    const ch = window.innerHeight - 100
    const cols = this.cols
    const rows = this.rows
    const k = Math.min(cw / cols, ch / rows)
    const w = k * cols
    const h = k * rows
    const x = (cw - w) / 2 + 50
    const y = (ch - h) / 2 + 50

    this.ctx.fillStyle = '#999'
    this.ctx.fillRect(0, 0, cw + 100, ch + 100)

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = this.map[r][c]
        const fill = v < 0 ? '#ccc' : '#aaa'

        this.ctx.strokeStyle = '#666'
        this.ctx.fillStyle = fill
        this.ctx.fillRect(x + c * k, y + r * k, k, k)
        this.ctx.strokeRect(x + c * k, y + r * k, k, k)

        if (v === -9) {
          this.ctx.beginPath()
          this.ctx.arc(x + c * k + k / 2, y + r * k + k / 2, k / 3, 0, Math.PI * 2)
          this.ctx.closePath()
          this.ctx.fillStyle = '#000'
          this.ctx.fill()
        } else if (v < 0 && v > -10) {
          this.ctx.fillStyle = '#666'
          this.ctx.textAlign = 'center'
          this.ctx.textBaseline = 'middle'
          this.ctx.font = '12px sanserif'
          this.ctx.fillText(-v, x + c * k + k / 2, y + r * k + k / 2)
        }
      }
    }
  },

  sweep (r, c) {
    const v = this.map[r][c]
    if (v < 0) return
    if (v === 0) {
      this.map[r][c] = -10

      if (r > 0 && c > 0) this.sweep(r - 1, c - 1)
      if (r > 0) this.sweep(r - 1, c)
      if (r > 0 && c < this.cols - 1) this.sweep(r - 1, c + 1)

      if (c > 0) this.sweep(r, c - 1)
      if (c < this.cols - 1) this.sweep(r, c + 1)

      if (r < this.rows - 1 && c > 0) this.sweep(r + 1, c - 1)
      if (r < this.rows - 1) this.sweep(r + 1, c)
      if (r < this.rows - 1 && c < this.cols - 1) this.sweep(r + 1, c + 1)
    } else if(v < 9) {
      this.map[r][c] = -v
    }

    if(this.checkWin()) this.gameover(true)
    else this.render()
  },

  checkWin () {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const v = this.map[r][c]
        if (v >= 0 && v < 9) {
          return false
        }
      }
    }

    return true
  },

  gameover (win) {
    this.status = -1
    this.end()
    
    const cw = window.innerWidth
    const ch = window.innerHeight
    const text = win ? 'You Win!' : 'You Lose'

    this.ctx.fillStyle = 'rgba(200, 200, 200, .6)'
    this.ctx.fillRect(0, 0, cw, ch)
    this.ctx.fillStyle = '#000'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.font = '50px sanserif bold'
    this.ctx.fillText(text, cw / 2, ch / 2)
  },

  end () {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const v = this.map[r][c]
        if (v > 0) {
          this.map[r][c] = -v
        } else if (v === 0) {
          this.map[r][c] = -10
        }
      }
    }

    this.render()
  },
  
  onclick (e) {
    if (this.status === -1) {
      this.start()
      return 
    }

    const { r, c } = this.resolveEventCoord(e)
    if (r < 0 || r > this.rows - 1 || c < 0 || c > this.cols - 1) return

    if (this.status === 0) {
      this.status = 1
      this.initMine(r, c)
      this.sweep(r, c)
    } else {
      const v = this.map[r][c]
      if (v === 9) this.gameover()
      else if (v > 0) this.sweep(r, c)
    }
  },

  resolveEventCoord (e) {
    const ex = e.offsetX
    const ey = e.offsetY
    const cw = window.innerWidth - 100
    const ch = window.innerHeight - 100
    const cols = this.cols
    const rows = this.rows
    const k = Math.min(cw / cols, ch / rows)
    const w = k * cols
    const h = k * rows
    const x = (cw - w) / 2 + 50
    const y = (ch - h) / 2 + 50
    const r = Math.floor((ey - y) / k)
    const c = Math.floor((ex - x) / k)

    return { r, c }
  }
}