const context = document.createElement('canvas').getContext('2d')
const backingStore = context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio || 1

const pixelRatio = (window.devicePixelRatio || 1) / backingStore

function resize (canvas) {
  canvas.style.width = canvas.width + 'px'
  canvas.style.height = canvas.height + 'px'
  canvas.width *= pixelRatio
  canvas.height *= pixelRatio
}

function hidpi (canvas) {
  if (pixelRatio === 1) return

  resize(canvas)

  canvas.getContext = function (type) {
    const context = HTMLCanvasElement.prototype.getContext.call(this, type)
    const forEach = (obj, func) => {
      for (const k in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(k)) {
          func(obj[k], k)
        }
      }
    }

    (function (ctx) {
      const ratioArgs = {
        fillRect: 'all',
        clearRect: 'all',
        moveTo: 'all',
        lineTo: 'all',
        arc: [0, 1, 2],
        drawImage: [1, 2, 3, 4],
        arcTo: 'all',
        bezierCurveTo: 'all',
        isPointInPath: 'all',
        isPointInStroke: 'all',
        quadraticCurveTo: 'all',
        rect: 'all',
        translate: 'all',
        createRadialGradient: 'all',
        createLinearGradient: 'all',
        getImageData: 'all',
        putImageData: [1, 2]
      }

      forEach(ratioArgs, function (value, key) {
        if (CanvasRenderingContext2D.prototype[key]) {
          ctx[key] = (function (_super) {
            return function () {
              let i
              let len
              let args = Array.prototype.slice.call(arguments)

              if (value === 'all') {
                args = args.map(a => a * pixelRatio)
              } else if (Array.isArray(value)) {
                for (i = 0, len = value.length; i < len; i++) {
                  args[value[i]] *= pixelRatio
                }
              }

              return _super.apply(this, args)
            }
          })(CanvasRenderingContext2D.prototype[key])
        }
      })

      ctx.stroke = (function () {
        return function () {
          this.lineWidth *= pixelRatio
          CanvasRenderingContext2D.prototype.stroke.apply(this, arguments)
          this.lineWidth /= pixelRatio
        }
      })()
      ctx.strokeRect = (function () {
        return function () {
          this.lineWidth *= pixelRatio
          let args = Array.prototype.slice.call(arguments)
          args = args.map(function (a) {
            return a * pixelRatio
          })
          CanvasRenderingContext2D.prototype.strokeRect.apply(this, args)
          this.lineWidth /= pixelRatio
        }
      })()

      ctx.fillText = (function () {
        return function () {
          const args = Array.prototype.slice.call(arguments)

          args[1] *= pixelRatio // x
          args[2] *= pixelRatio // y

          this.font = this.font.replace(
            /(\d+)(px|em|rem|pt)/g,
            function (w, m, u) {
              return (m * pixelRatio) + u
            }
          )

          CanvasRenderingContext2D.prototype.fillText.apply(this, args)

          this.font = this.font.replace(
            /(\d+)(px|em|rem|pt)/g,
            function (w, m, u) {
              return (m / pixelRatio) + u
            }
          )
        }
      })()

      ctx.strokeText = (function () {
        return function () {
          const args = Array.prototype.slice.call(arguments)

          args[1] *= pixelRatio // x
          args[2] *= pixelRatio // y

          this.font = this.font.replace(
            /(\d+)(px|em|rem|pt)/g,
            function (w, m, u) {
              return (m * pixelRatio) + u
            }
          )

          CanvasRenderingContext2D.prototype.strokeText.apply(this, args)

          this.font = this.font.replace(
            /(\d+)(px|em|rem|pt)/g,
            function (w, m, u) {
              return (m / pixelRatio) + u
            }
          )
        }
      })()
    })(context)

    return context
  }
}