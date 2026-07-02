export const ORBIT_SEQUENCE = {
  frameCount: 112,
  path(index) {
    return `./assets/sequence/orbit/frame-${String(index + 1).padStart(3, '0')}.webp`;
  },
  chapterStops: [0, 0.36, 0.7, 1]
};

export const COLORWAYS = {
  black: {
    name: 'Carbon Black',
    word: 'BLACK',
    image: './assets/images/editorial/black.webp',
    responsiveImage: './assets/images/responsive/black-960.webp',
    background: '#d8d7d1'
  },
  red: {
    name: 'Burgundy Red',
    word: 'RED',
    image: './assets/images/editorial/red.webp',
    responsiveImage: './assets/images/responsive/red-960.webp',
    background: '#d7b2ae'
  },
  blue: {
    name: 'Deep Blue',
    word: 'BLUE',
    image: './assets/images/editorial/blue.webp',
    responsiveImage: './assets/images/responsive/blue-960.webp',
    background: '#abb9ca'
  }
};
