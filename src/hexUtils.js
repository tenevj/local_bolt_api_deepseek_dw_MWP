export class HexUtils {
      static directions = [
        [1, 0], [1, -1], [0, -1],
        [-1, 0], [-1, 1], [0, 1]
      ]

      static hexToPixel(hex, size) {
        const x = size * (3/2 * hex.q)
        const y = size * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r)
        return { x, y }
      }

      static pixelToHex(point, size) {
        const q = (2/3 * point.x) / size
        const r = (-1/3 * point.x + Math.sqrt(3)/3 * point.y) / size
        return this.roundHex({ q, r, s: -q-r })
      }

      static roundHex(hex) {
        let q = Math.round(hex.q)
        let r = Math.round(hex.r)
        let s = Math.round(hex.s)
        
        const qDiff = Math.abs(q - hex.q)
        const rDiff = Math.abs(r - hex.r)
        const sDiff = Math.abs(s - hex.s)

        if (qDiff > rDiff && qDiff > sDiff) {
          q = -r - s
        } else if (rDiff > sDiff) {
          r = -q - s
        } else {
          s = -q - r
        }
        
        return { q, r, s }
      }

      static getNeighbors(hex) {
        return this.directions.map(([dq, dr]) => ({
          q: hex.q + dq,
          r: hex.r + dr,
          s: hex.s - dq - dr
        }))
      }

      static hexDistance(a, b) {
        return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2
      }

      static findClosestEmptyHex(startHex, isOccupied, maxDistance = 10) {
        const visited = new Set()
        const queue = [{ hex: startHex, distance: 0 }]
        
        while (queue.length > 0) {
          const current = queue.shift()
          const key = `${current.hex.q},${current.hex.r}`
          
          if (visited.has(key)) continue
          visited.add(key)
          
          if (!isOccupied(current.hex)) {
            return current.hex
          }
          
          if (current.distance < maxDistance) {
            this.getNeighbors(current.hex).forEach(neighbor => {
              queue.push({ hex: neighbor, distance: current.distance + 1 })
            })
          }
        }
        return null
      }
    }
