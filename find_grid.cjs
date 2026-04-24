const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('public/board-bg.png')
  .pipe(new PNG())
  .on('parsed', function() {
    console.log(`Image dimensions: ${this.width}x${this.height}`);
    
    // We want to find the horizontal boundaries of the tiles.
    // Let's scan a line across the top edge, say at Y = 10% of height.
    const y = Math.floor(this.height * 0.05);
    let borderXs = [];
    let isBlack = false;
    let currentColor = '';
    
    // Just dump the brightness of the first 25% of pixels on that line to see the pattern
    let sample = [];
    for (let x = 0; x < this.width; x++) {
      let idx = (this.width * y + x) << 2;
      let r = this.data[idx];
      let g = this.data[idx+1];
      let b = this.data[idx+2];
      let brightness = (r + g + b) / 3;
      
      // Black borders are usually very dark. Let's say brightness < 20.
      if (brightness < 30) {
        if (!isBlack) {
          borderXs.push(x);
          isBlack = true;
        }
      } else {
        isBlack = false;
      }
    }
    
    console.log(`Found possible column starts at Y=${y}:`, borderXs);
    
    // Do the same for a column to find row heights just in case
    const xScan = Math.floor(this.width * 0.05);
    let borderYs = [];
    isBlack = false;
    for (let currentY = 0; currentY < this.height; currentY++) {
      let idx = (this.width * currentY + xScan) << 2;
      let r = this.data[idx];
      let g = this.data[idx+1];
      let b = this.data[idx+2];
      let brightness = (r + g + b) / 3;
      if (brightness < 30) {
        if (!isBlack) {
          borderYs.push(currentY);
          isBlack = true;
        }
      } else {
        isBlack = false;
      }
    }
    console.log(`Found possible row starts at X=${xScan}:`, borderYs);
  });
