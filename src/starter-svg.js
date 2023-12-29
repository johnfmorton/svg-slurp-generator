import {
    createNoiseGrid,
    createVoronoiTessellation,
    random,
    randomBias,
    map,
    spline,
    pointsInPath,
    seedPRNG,
} from '@georgedoescode/generative-utils'

import { mySettings } from './settingsManager.js'
const settings = _settingsInit()

// export the svgGenerator function
export function svgGenerator(svgObj) {
  // clear the existing svg of any elements
  svgObj.clear()

  // get the width and height of the svg canvas
  const { width, height } = svgObj.viewbox()

  const debug = settings.debug ?? false

    // If the resetSeed toggle is checked (true), or if there is no seed value assigned
    if (settings.resetSeed || !settings.seedValue) {
        // create a new random seed number
        let myseed = Math.floor(Math.random() * 100000)
        // assign the seed value to the settings object`
        settings.seedValue = myseed
        // set the seed for the PRNG
        seedPRNG(myseed)
    } else if (settings.seedValue) {
        // set the seed for the PRNG
        seedPRNG(settings.seedValue)
    }

    // This is where the custom code begins

    // find the center of the canvas
    const centerX = width / 2
    const centerY = height / 2
    const radius = height / 2

    // Get the number of points to draw from the settings object or use the default value of 500
    let numPoints = settings.numPoints ?? 500

    // An array to hold the points
    let points = []
    // loop through the number of points we want to draw
    for (let i = 0; i < numPoints; i++) {
        // get a random angle between 0 and 2PI
        const angle = random(0, Math.PI * 2)
        // get a random radius between 0 and the radius of the circle
        const r = random(0, radius)
        // get the x and y coordinates of the point
        const x = centerX + r * Math.cos(angle)
        const y = centerY + r * Math.sin(angle)

        // add the point to the points array
        points.push({ x, y })
    }

  // create Noise Grid
  const noiseGrid = createNoiseGrid({
      width,
      height,
      resolution: 22,
    //   noiseFn: (x, y) => {
    //       return random(0, 1)
    // },
    xInc: 0.01,
    yInc: 0.01,
      seed: random(0, 10000),
  })

  // debugger;
  if (debug) {
      // draw the noise grid
      noiseGrid.cells.forEach((cell) => {
          // get the noise value
          const noiseValue = cell.noiseValue
          // get the color based on the noise value in hexidecimal
          const colorHex = _valueToColor(noiseValue * 1.5)

          // debugger;
          // draw a circle
          // svgObj.circle(10).cx(cell.centroid.x).cy(cell.centroid.y).fill(`hsl(${color}, 100%, 50%)`)

          // draw a rectangle
          // svgObj.rect(cell.width, cell.height).x(cell.x).y(cell.y).fill(`hsl(${color}, 100%, 50%)`)
          // draw the text value in each cell
          svgObj
              .text(cell.noiseValue)
              .x(cell.x)
              .y(cell.y)
              .font({
                  size: 10,
                  family: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace",
                  anchor: 'middle',
              })
              .rotate(cell.noiseValue * 300, cell.x, cell.y)
              .fill(colorHex)
          // .style('color', 'blue')
          // .color(`hsl(${color}, 100%, 50%)`)
      })
  }



    // draw a voronoi diagram
    const tessellation = createVoronoiTessellation({
        width,
        height,
        points,
        iterations: 6,
    })

  tessellation.cells.forEach((cell) => {

    // get the noise value
    const noiseValue = noiseGrid.lookup({
        x: cell.centroid.x,
        y: cell.centroid.y,
    }).noiseValue

        if (!debug) {
            svgObj.polygon(cell.points).fill('none').stroke('#999999')
          // debugger;
          // svgObj.rect(cell.width, cell.height).attr({ x: cell.x, y: cell.y }).fill('#ff0').stroke('#999999')
          svgObj
              .rect(cell.innerCircleRadius, 10)
              .attr({
                  x: cell.centroid.x - cell.innerCircleRadius / 2,
                  y: cell.centroid.y - 5,
              })
              .fill('#ff0')
              .stroke('#999999')
              .transform({
                  rotate: noiseValue * 300,
                  origin: [cell.centroid.x, cell.centroid.y],
              })
            console.log(cell)
        } else {
            // figure out the angle of the triangle based on the center of the page and the center of the cell
            const pageCenterX = width / 2
            const pageCenterY = height / 2

            const deltaX = pageCenterX - cell.centroid.x
            const deltaY = pageCenterY - cell.centroid.y

            const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI

            // get the #rotation input, if it exists
            const rotationEl = document.getElementById('rotation')

            let angleUpdate = 0
            if (rotationEl) {
                // update the rotation
                angleUpdate = rotationEl.value
            }

            let updatedAngle = angle + Number(angleUpdate)

            // svgObj.path('M 0 0 L ' + cell.innerCircleRadius + ' 0 L ' + cell.innerCircleRadius/2 + ' ' + cell.innerCircleRadius + ' z').fill("#fff").stroke("#000").x(cell.centroid.x - (cell.innerCircleRadius/2)).y(cell.centroid.y- (cell.innerCircleRadius/2.5)).rotate(updatedAngle);
            svgObj
                .circle(cell.innerCircleRadius)
                .cx(cell.centroid.x)
                .cy(cell.centroid.y)
                .fill('none')
                .stroke('#000')

            // path('M 0 0 L ' + cell.innerCircleRadius + ' 0 L ' + cell.innerCircleRadius/2 + ' ' + cell.innerCircleRadius + ' z').fill("#fff").stroke("#000").x(cell.centroid.x - (cell.innerCircleRadius/2)).y(cell.centroid.y- (cell.innerCircleRadius/2.5)).rotate(updatedAngle);
        }
    })
}

function _valueToColor(value) {

  // debugger;
    // Ensure the input is within the expected range
    value = Math.max(-5, Math.min(5, value))

    // Map the value from the range -5 to 5 to the range 0 to 255
    // This will be used as the red component of the RGB color
    let red = Math.round((255 * (value + 5)) / 10)

    // Set green and blue components to a constant value
    let green = 100
    let blue = 100

    // Convert the RGB values to a hex string
    let color = `#${red.toString(16).padStart(2, '0')}${green
        .toString(16)
        .padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`

    return color
}



// helper function to initialize the settings manager
// use Shoelace Web Components to create the settings UI
// https://shoelace.style/
function _settingsInit() {
    // initialize the settings manager
    mySettings.init({ settingsElement: '#settings' })

    const numPoints = {
        sltype: 'sl-input',
        name: 'numPoints',
        options: {
            label: 'Number of points',
            type: 'number',
            min: 1,
            max: 1000,
            value: 50,
            step: 1,
            size: 'medium',
            helpText: 'The number of points used to draw the tessellation.',
        },
    }


    let divider = {
        sltype: 'sl-divider',
    }

    let resetSeedToggle = {
        sltype: 'sl-switch',
        name: 'resetSeed',
        options: {
            label: 'Reset Seed Each Time?',
            size: 'medium',
            helpText: 'Reset the seed on every generation',
            checked: true,
        },
    }

    let seed = {
        sltype: 'sl-input',
        name: 'seedValue',
        options: {
            label: 'Seed Value',
            type: 'text',
            value: 1234,
            step: 1,
            size: 'medium',
            helpText: 'The seed for the random number generator.',
        },
    }

    let myDebugOptions = {
        sltype: 'sl-switch',
        name: 'debug',
        options: {
            label: 'Debug',
            size: 'medium',
            helpText: 'Show debug info',
            checked: false,
        },
    }

    // add settings to the settings manager
    mySettings.add(
        numPoints,

        divider,
        resetSeedToggle,
        seed,
        divider,
        myDebugOptions
    )

    return mySettings
}
