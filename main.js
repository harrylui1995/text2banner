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
