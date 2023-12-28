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

    // draw a voronoi diagram
    const tessellation = createVoronoiTessellation({
        width,
        height,
        points,
        iterations: 6,
    })

    tessellation.cells.forEach((cell) => {
        if (debug) {
            svgObj.polygon(cell.points).fill('none').stroke('#999999')

            svgObj
                .circle(cell.innerCircleRadius * 1)
                .cx(cell.centroid.x)
                .cy(cell.centroid.y)
                .stroke('#f00')
                .fill('none')
                .scale(0.5)
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
                .fill('#fff')
                .stroke('#000')

            // path('M 0 0 L ' + cell.innerCircleRadius + ' 0 L ' + cell.innerCircleRadius/2 + ' ' + cell.innerCircleRadius + ' z').fill("#fff").stroke("#000").x(cell.centroid.x - (cell.innerCircleRadius/2)).y(cell.centroid.y- (cell.innerCircleRadius/2.5)).rotate(updatedAngle);
        }
    })
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
