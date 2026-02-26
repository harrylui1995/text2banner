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
  // Wire all controls to render
  document.getElementById('main-text').addEventListener('input', render);
  document.getElementById('subtitle-text').addEventListener('input', render);
  document.getElementById('font-select').addEventListener('change', render);
  document.getElementById('border-select').addEventListener('change', render);
  document.getElementById('align-select').addEventListener('change', render);

  render(); // initial render
}).catch(err => console.error('Font load error:', err));

let debounceTimer = null;

function render() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const mainText  = document.getElementById('main-text').value;
    const subtitle  = document.getElementById('subtitle-text').value;
    const font      = document.getElementById('font-select').value;
    const border    = document.getElementById('border-select').value;
    const align     = document.getElementById('align-select').value;
    const preview   = document.getElementById('preview');

    generateBanner(mainText, subtitle, font, border, align, result => {
      preview.textContent = result;
    });
  }, 150);
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
