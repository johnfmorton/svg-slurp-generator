import {
  createNoiseGrid,
  createVoronoiTessellation,
  random,
  randomBias,
  map,
  spline,
  pointsInPath
} from '@georgedoescode/generative-utils';

// export the svgGenerator function
export function svgGenerator(svgObj) {
  const { width, height } = svgObj.viewbox();
  svgObj.clear();

  const numStripes = 10;
  // stripe width === viewBox width / the amount of stripes we would like to paint
  const stripeWidth = width / numStripes;
  const colors = ["red", "orange", "green", "blue", "pink", "yellow"];

  for (let i = 0; i < width; i += stripeWidth) {
    // pick a number between 0 and 5 (the length of the colors array)
    const diceRoll = Math.floor(Math.random() * colors.length);
    // pick out the color from the array using diceRoll as the index
    const color = colors[diceRoll];

    // draw a colored stripe on the canvas based on the dice roll
    svgObj.rect(stripeWidth, height).x(i).y(0).fill(color).stroke("#fff");
  }
};
