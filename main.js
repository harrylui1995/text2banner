// Tell figlet.js where to load fonts from (unpkg CDN)
figlet.defaults({
  fontPath: 'https://unpkg.com/figlet@1.7.0/fonts'
});

// Preload all fonts used in the select so switching feels instant
const FONTS = ['Big', 'Standard', 'Slant', 'Shadow', 'Small', 'Banner'];

Promise.all(
  FONTS.map(font => new Promise((resolve, reject) => {
    figlet.preloadFonts([font], err => err ? reject(err) : resolve());
  }))
).then(() => {
  console.log('All fonts loaded');
  render(); // initial render once fonts are ready
}).catch(err => console.error('Font load error:', err));

function render() {
  console.log('render called');
}

// --- Banner generation ---

const BORDERS = {
  box: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
  ascii: { tl: '+', tr: '+', bl: '+', br: '+', h: '-', v: '|' },
  none: null,
};

/**
 * @param {string[]} lines   - text lines to wrap (already aligned)
 * @param {string} border    - 'box' | 'ascii' | 'none'
 * @param {string} align     - 'left' | 'center' | 'right'
 * @param {number} innerWidth - width of content area (excluding border chars)
 * @returns {string}
 */
function applyBorder(lines, border, align, innerWidth) {
  const b = BORDERS[border];

  // Pad each line to innerWidth based on alignment
  const padded = lines.map(line => {
    const len = line.length;
    const gap = innerWidth - len;
    if (align === 'left')   return line + ' '.repeat(gap);
    if (align === 'right')  return ' '.repeat(gap) + line;
    // center
    const left = Math.floor(gap / 2);
    const right = gap - left;
    return ' '.repeat(left) + line + ' '.repeat(right);
  });

  if (!b) return padded.join('\n');

  const top    = b.tl + b.h.repeat(innerWidth + 2) + b.tr;
  const bottom = b.bl + b.h.repeat(innerWidth + 2) + b.br;
  const middle = padded.map(l => b.v + ' ' + l + ' ' + b.v);

  return [top, ...middle, bottom].join('\n');
}

/**
 * Generates the full banner string and passes it to callback.
 * Uses figlet async API because font loading is async.
 */
function generateBanner(mainText, subtitle, font, border, align, callback) {
  if (!mainText.trim()) {
    callback('← type something above');
    return;
  }

  figlet.text(mainText, { font }, (err, figletOutput) => {
    if (err) {
      callback('Error rendering font: ' + err.message);
      return;
    }

    // figlet output lines (trim trailing whitespace per line)
    const figletLines = figletOutput.split('\n').map(l => l.trimEnd());

    // Build content lines: figlet art + optional subtitle
    const contentLines = [...figletLines];
    if (subtitle.trim()) {
      contentLines.push(''); // blank spacer
      contentLines.push(subtitle.trim());
    }

    // Inner width = longest line
    const innerWidth = Math.max(...contentLines.map(l => l.length));

    const result = applyBorder(contentLines, border, align, innerWidth);
    callback(result);
  });
}
