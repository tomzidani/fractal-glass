document.addEventListener('DOMContentLoaded', () => {
  const fractalGlassComponent = document.querySelectorAll('[data-component="fractal-glass"]')
  fractalGlassComponent.forEach((c) => new FractalGlass(c))
})

class FractalGlass {
  el
  imageEl
  glassEl

  imageWidth
  imageHeight
  imageSourceWidth
  imageSourceHeight

  canvas
  ctx

  columnsNumber = 30
  columnsWidth

  distortion = 3

  resizeTick = null

  constructor(el) {
    this.el = el
    this.imageEl = el.querySelector('[data-element="image"]')
    this.glassEl = el.querySelector('[data-element="glass"]')

    this.init()
  }

  init() {
    this.initCanvas()
    this.getImageDimensions()
    this.getColumnsWidth()
    this.initColumns()
    this.bindEvents()
  }

  initCanvas() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
  }

  getImageDimensions() {
    this.imageWidth = this.imageEl.width
    this.imageHeight = this.imageEl.height
    this.imageSourceWidth = this.imageEl.naturalWidth
    this.imageSourceHeight = this.imageEl.naturalHeight
  }

  getColumnsWidth() {
    this.columnsWidth = 100 / this.columnsNumber
  }

  initColumns() {
    const columns = []

    for (let i = 0; i < this.columnsNumber; i++) {
      const c = document.createElement('div')

      this.setColumnProperties(c, i)

      this.glassEl.appendChild(c)
      columns.push(c)
    }

    this.columns = columns
  }

  setColumnProperties(c, i) {
    const startXPercent = this.columnsWidth * i
    const endXPercent = this.columnsWidth + startXPercent

    const imagePortion = this.getImagePortion(startXPercent, endXPercent)

    c.style.backgroundImage = `url('${imagePortion}')`
    c.style.width = `${this.canvas.width / this.distortion}px`
    c.style.height = `${this.canvas.height}px`
    c.style.left = `${(this.canvas.width / this.distortion) * i}px`
  }

  getImagePortion(startXPercent, endXPercent) {
    let startX = this.imageWidth * (startXPercent / 100)
    let startSourceX = this.imageSourceWidth * (startXPercent / 100)

    const endX = this.imageWidth * (endXPercent / 100)
    const endSourceX = this.imageSourceWidth * (endXPercent / 100)

    const portionWidth = (endX - startX) * this.distortion
    const portionSourceWidth = (endSourceX - startSourceX) * this.distortion

    const isPortionWidthGreaterThanImageWidth = startX + portionWidth > this.imageWidth
    const isPortionSourceWidthGreaterThanImageSourceWidth = startSourceX + portionSourceWidth > this.imageSourceWidth

    if (isPortionWidthGreaterThanImageWidth) startX = this.imageWidth - portionWidth
    if (isPortionSourceWidthGreaterThanImageSourceWidth) startSourceX = this.imageSourceWidth - portionSourceWidth

    this.canvas.width = portionWidth
    this.canvas.height = this.imageHeight

    this.ctx.drawImage(this.imageEl, startSourceX, 0, portionSourceWidth / 2, this.imageSourceHeight, portionWidth / 2, 0, portionWidth / 2, this.imageHeight)
    this.ctx.scale(-1, 1)
    this.ctx.drawImage(this.imageEl, startSourceX, 0, portionSourceWidth / 2, this.imageSourceHeight, -(portionWidth / 2), 0, portionWidth / 2, this.imageHeight)
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)

    return this.canvas.toDataURL()
  }

  handleResize() {
    this.getImageDimensions()

    this.columns.forEach((c, i) => {
      this.setColumnProperties(c, i)
    })
  }

  debounce(func, delay) {
    let timeout

    return () => {
      clearTimeout(timeout)

      timeout = setTimeout(() => {
        func.apply(this, arguments)
      }, delay)
    }
  }

  bindEvents() {
    this.handleResize = this.handleResize.bind(this)
    this.resizeTick = this.debounce(this.handleResize, 200)

    window.addEventListener('resize', this.resizeTick)
  }
}
