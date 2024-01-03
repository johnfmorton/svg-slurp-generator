import {
    createNoiseGrid,
    createQtGrid,
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
    }

    seedPRNG(settings.seedValue)
    // create Noise Grid
    const noiseGrid = createNoiseGrid({
        width,
        height,
        resolution: 25,
        xInc: 0.01,
        yInc: 0.01,
        seed: random(0, 10000),
    })

    // Get the number of points to draw from the settings object or use the default value of 500
    let numPoints = settings.numPoints ?? 10

  console.log('numPoints', numPoints)

  let shrunkenBoxChance = settings.shrunkenBoxChance ?? 50;

    let loopsOfGrids = 2

    for (let i = 0; i < loopsOfGrids; i++) {
        console.log('loop ' + (i + 1))

        // An array to hold the points
        let points = []

        const focus = {
            x: random(0, width),
            y: random(0, height),
        }

        points = [...Array(Number(numPoints))].map(() => {
            console.log('focus', focus)
            return {
                x: randomBias(0, width, focus.x, 1),
                y: randomBias(0, height, focus.y, 1),
                width: 1,
                height: 1,
            }
        })

        const qgrid = createQtGrid({
            width: width,
            height: height,
            points: points,
            maxQtObjects: 1,
            maxQtLevels: 10,
            gap: i * 10,
        })

        // draw the cells as circles
        qgrid.areas.forEach((cell, i) => {
            const drawChance = random(0, 1)
           // use the noiseGrid to get the noise value for the cell
            const noiseValue = noiseGrid.cells[i].noiseValue
            if (drawChance > shrunkenBoxChance / 100) {
                // randomly choose 45 degree angles in 45 degree increments
                // const angleChoices = [45, 135, 225, 315]
                // const angle = angleChoices[Math.floor(Math.random() * angleChoices.length)]
                // if i is odd, angle is 45 degrees, if i is even, angle is 135 degrees
                // const angle = i % 2 === 0 ? 45 : 135

                svgObj
                    .rect(cell.width, cell.height)
                    .attr({ x: cell.x, y: cell.y })
                    .radius(0)
                    .rotate(noiseValue * 8.854)
                    .fill('none')
                    .stroke('#000')
            } else {
                svgObj
                    .rect(cell.width, cell.height)
                    .attr({ x: cell.x, y: cell.y })
                    // .scale(-i * 0.1, -i * 0.1)
                    .scale(0.5)
                    .rotate(-noiseValue * 8.854)
                    // .rotate(i*2)

                    .fill('none')
                    .stroke({ width: 2, color: '#000' })
            }
        })
    }

    // debugger;
    if (debug) {
        // draw the noise grid
        // noiseGrid.cells.forEach((cell) => {
        //     // get the noise value
        //     const noiseValue = cell.noiseValue
        //     // get the color based on the noise value in hexidecimal
        //     const colorHex = _valueToColor(noiseValue * 1.5)
        //     // debugger;
        //     svgObj
        //         .text(cell.noiseValue)
        //         .x(cell.x)
        //         .y(cell.y)
        //         .font({
        //             size: 10,
        //             family: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace",
        //             anchor: 'middle',
        //         })
        //         .rotate(cell.noiseValue * 300, cell.x, cell.y)
        //         .fill(colorHex)
        // })
    }
}

function _valueToColor(value) {
    // debugger;
    // Ensure the input is within the expected range
    value = Math.max(-5, Math.min(5, value))

    // Map the value from the range -5 to 5 to the range 0 to 255
    // This will be used as the red component of the RGB color
    let red = Math.round((255 * (value + 5)) / 10)

    // Set green and blue components to a constant value
    let green = Math.round((255 * (value + 5)) / 10)
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

    // const numPoints = {
    //     sltype: 'sl-input',
    //     name: 'numPoints',
    //     options: {
    //         label: 'Number of points',
    //         type: 'number',
    //         min: 1,
    //         max: 1000,
    //         value: 50,
    //         step: 1,
    //         size: 'medium',
    //         helpText: 'The number of points used to draw the tessellation.',
    //     },
    // }

    const numPoints = {
        sltype: 'sl-range',
        name: 'numPoints',
        options: {
            label: 'Number of points',
            min: 1,
            max: 200,
            value: 200,
            step: 1,
            size: 'medium',
            helpText: 'The number of points used to draw the quadtree grid.',
        },
    }

  const shrunkenBoxChance = {
        sltype: 'sl-range',
        name: 'shrunkenBoxChance',
        options: {
            label: 'Chance of drawing a smaller box',
            min: 0,
            max: 100,
            value: 0,
            step: 1,
            size: 'medium',
            helpText: 'The boxes have a chance of being large or small. The larger this value, the higher the chance of a small box will be rendered.',
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
        shrunkenBoxChance,
        divider,
        resetSeedToggle,
        seed,
        divider,
        myDebugOptions
    )

    return mySettings
}
