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

  // find the center of the canvas
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = height / 2;


  // draw a circle at the center of the canvas
  // svgObj.circle(radius).center(centerX, centerY).fill("#fff").stroke("#f00");

  // loop through the number of points we want to draw
  let numPoints = 500;

  // check if the #num-points input exists
  const numPointsEl = document.getElementById("num-points");
  if (numPointsEl) {
    // update the number of points
    numPoints = numPointsEl.value;
  }

  let points = [];
  // loop through the number of points we want to draw
  for (let i = 0; i < numPoints; i++) {
    // get a random angle between 0 and 2PI
    const angle = random(0, Math.PI * 2);
    // get a random radius between 0 and the radius of the circle
    const r = random(0, radius);
    // get the x and y coordinates of the point
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);

    // add the point to the points array
    points.push({ x, y });
  }


  // draw a voronoi diagram
  const tessellation = createVoronoiTessellation({ width, height, points, iterations: 6 });

  let debug = false;
  // check if the #debug input exists
  const debugEl = document.getElementById("debug");
  if (debugEl) {
    // update the number of points
    debug = debugEl.checked;
  }

  const svgCatPath = 'm89.07 58.359-12.102-1.6406c0.26953-1.1719 0.42969-2.3711 0.44141-3.6094l11.078-1.0195c0.62109-0.058594 1.0781-0.60938 1.0195-1.2305-0.058593-0.62109-0.60156-1.0781-1.2305-1.0195l-11.012 1.0117c-0.32031-2.4297-1.2109-4.7305-2.5117-6.8516 2-6.9688 2.6016-15.578-0.91016-17.309-2.9805-1.4688-8.1719 2.4219-12.328 7.1797-3.4883-1.25-7.3711-1.9688-11.48-1.9688s-7.9805 0.71875-11.48 1.9688c-4.1719-4.7617-9.3594-8.6484-12.328-7.1797-3.5 1.7305-2.9102 10.34-0.91016 17.309-1.3008 2.1211-2.1797 4.4102-2.5117 6.8516l-11.012-1.0117c-0.62891-0.058594-1.1719 0.39844-1.2305 1.0195s0.39844 1.1719 1.0195 1.2305l11.078 1.0195c0.011719 1.2305 0.17188 2.4297 0.44141 3.6094l-12.102 1.6406c-0.62109 0.078125-1.0508 0.64844-0.96875 1.2695 0.078125 0.62109 0.64844 1.0508 1.2695 0.96875l12.449-1.6797c0.46875 1.2383 1.0781 2.4219 1.8203 3.5508l-11.98 4.5195c-0.57812 0.21875-0.87891 0.87109-0.66016 1.4609 0.19141 0.5 0.69922 0.78906 1.2109 0.71875 0.078125-0.011719 0.17188-0.03125 0.25-0.058594l12.609-4.7383c4.8594 5.8711 13.359 9.7695 23.059 9.7695 9.6992 0 18.199-3.8984 23.059-9.7695l12.57 4.7383c0.078125 0.03125 0.16016 0.050781 0.25 0.058594 0.51172 0.070312 1.0195-0.21875 1.2109-0.71875 0.21875-0.58984-0.078126-1.2383-0.66016-1.4609l-11.988-4.5195c0.73828-1.1289 1.3516-2.3203 1.8203-3.5508l12.449 1.6797c0.62109 0.078125 1.1914-0.35156 1.2695-0.96875 0.089844-0.61719-0.34766-1.1875-0.96875-1.2695zm-52.891-3.8203c-2.7305 0-4.9492-2.2188-4.9492-4.9492 0-2.7305 2.2188-4.9492 4.9492-4.9492 2.7305 0 4.9492 2.2188 4.9492 4.9492 0 2.7305-2.207 4.9492-4.9492 4.9492zm27.742 0c-2.7305 0-4.9492-2.2188-4.9492-4.9492 0-2.7305 2.2188-4.9492 4.9492-4.9492s4.9492 2.2188 4.9492 4.9492c0 2.7305-2.2109 4.9492-4.9492 4.9492z';



  tessellation.cells.forEach((cell) => {
    if (debug) {
      svgObj.polygon(cell.points).fill("none").stroke("#999999");

      svgObj
        .circle(cell.innerCircleRadius * 1)
        .cx(cell.centroid.x)
        .cy(cell.centroid.y)
        .stroke("#f00")
        .fill("none").scale(0.5);
      console.log(cell);

    } else {

      // figure out the angle of the triangle based on the center of the page and the center of the cell
      const pageCenterX = width / 2;
      const pageCenterY = height / 2;

      const deltaX = pageCenterX - cell.centroid.x;
      const deltaY = pageCenterY - cell.centroid.y;

      const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

      // get the #rotation input, if it exists
      const rotationEl = document.getElementById("rotation");


      let angleUpdate = 0;
      if (rotationEl) {
        // update the rotation
        angleUpdate = rotationEl.value;
      }

      let updatedAngle = angle + Number(angleUpdate);

      // svgObj.path('M 0 0 L ' + cell.innerCircleRadius + ' 0 L ' + cell.innerCircleRadius/2 + ' ' + cell.innerCircleRadius + ' z').fill("#fff").stroke("#000").x(cell.centroid.x - (cell.innerCircleRadius/2)).y(cell.centroid.y- (cell.innerCircleRadius/2.5)).rotate(updatedAngle);

      svgObj.path(svgCatPath).fill("#fff").stroke("#000").x(cell.centroid.x - (cell.innerCircleRadius/2)).y(cell.centroid.y- (cell.innerCircleRadius*0.99)).rotate(updatedAngle).scale(cell.innerCircleRadius/65);
    }
  });
}







// create a container for the setting inputs to live inside
const settingsContainer = document.getElementById("settings");


// create a container for the setting fields
const settingsInnerContainer = document.createElement("div");

settingsInnerContainer.classList.add("settings-container");


// text black so it's visible on the white background
settingsInnerContainer.style.color = "#000";

// display flex flexcolumn so the inputs stack on top of each other
settingsInnerContainer.style.display = "flex";
settingsInnerContainer.style.flexDirection = "column";
// set gap to 1rem so the inputs are spaced out
settingsInnerContainer.style.gap = "1.5rem";

// add the container to the settings container
settingsContainer.appendChild(settingsInnerContainer);


// add the container to the page
document.body.appendChild(settingsContainer);

// make a container for the number of points input
const numPointsContainer = document.createElement("div");

// text black so it's visible on the white background
numPointsContainer.style.color = "#000";

// display flex flexcolumn so the inputs stack on top of each other
numPointsContainer.style.display = "flex";
numPointsContainer.style.flexDirection = "column";


// add the container to the settings container
settingsInnerContainer.appendChild(numPointsContainer);

// // create a label for the number of points
// const numPointsLabel = document.createElement("label");
// numPointsLabel.for = "num-points";
// numPointsLabel.innerHTML = "Number of triangles, 1-2000";
// // add the label to the page
// numPointsContainer.appendChild(numPointsLabel);

// create a text field to the page to set the number of points
const numPointsEl = document.createElement("sl-range");
numPointsEl.id = "num-points";
numPointsEl.label = "Number of Cells";
numPointsEl.helpText = "Adjust the number of cells in the image."
numPointsEl.value = 500;
numPointsEl.min = 1;
numPointsEl.max = 2000;
// add the text field to the page
numPointsContainer.appendChild(numPointsEl);

numPointsEl.addEventListener("change", () => {
  // update the number of points
  numPoints = numPointsEl.value;
  // regenerate the SVG
  svgGenerator(svgGenerated);
});

// create a container for the rotation input
const rotationContainer = document.createElement("div");

// create a range input for the rotation
const rotationEl = document.createElement("sl-range");
rotationEl.id = "rotation";
rotationEl.label = "Rotation offset";
rotationEl.helpText = "Adjust the rotation of the image."
rotationEl.value = 0;
rotationEl.min = -180;
rotationEl.max = 180;

// add the text field to the page
rotationContainer.appendChild(rotationEl);
// add the container to the settings container
settingsInnerContainer.appendChild(rotationContainer);


// create a debug checkbox
const debugEl = document.createElement("sl-checkbox");
debugEl.id = "debug";
debugEl.innerHTML = "Debug";
debugEl.checked = false;
// add the checkbox to the page
settingsInnerContainer.appendChild(debugEl);

// create a sl-range for the volume
//<sl-range label="Volume" help-text="Controls the volume of the current song." min="0" max="100"></sl-range>
// const volumeContainer = document.createElement("div");
// const volumeInput = document.createElement("sl-range");
// volumeInput.label = "Volume";
// volumeInput = "Controls the volume of the current song.";
// volumeInput.min = 0;
// volumeInput.max = 100;
// volumeInput.value = 50;
// // add the volume input to the volume container
// volumeContainer.appendChild(volumeInput);
// // add the volume container to the settings container
// settingsContainer.appendChild(volumeContainer);
