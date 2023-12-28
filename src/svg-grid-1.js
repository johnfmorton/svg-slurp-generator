import {
    createNoiseGrid,
    createVoronoiTessellation,
    createQtGrid,
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

    const { width, height } = svgObj.viewbox()
    svgObj.clear()

    let debug = settings.debug ?? false

    let closeShape = settings.closeShape ?? false
    // check if the #closeShape input exists

    let quatTreeLevels = settings.quatTreeLevels ?? 1

    // loop through the number of points we want to draw
    let numPoints = settings.numPoints ?? 500

    // get the corner tension value
    let cornerTension = settings.cornerTension ?? 1

    const focus = {
        x: random(0, width),
        y: random(0, height),
    }

    const points = [...Array(numPoints)].map(() => {
        return {
            x: randomBias(0, width, focus.x, 1),
            y: randomBias(0, height, focus.y, 1),
            width: 1,
            height: 1,
        }
    })

    const grid = createQtGrid({
        width,
        height,
        points,
        gap: 0,
        maxQtLevels: quatTreeLevels,
    })

    // make a new array with the points at the center of each grid element
    const gridCenterPoints = grid.areas.map((area) => {
        return {
            x: area.x + area.width / 2,
            y: area.y + area.height / 2,
        }
    })

    grid.areas.forEach((area) => {
        if (debug == true) {
            svgObj
                .rect(area.width, area.height)
                .x(area.x)
                .y(area.y)
                .fill('none')
                .stroke('#a1a1a1')
        }
    })

    // draw a circle on each point
    if (debug) {
        gridCenterPoints.forEach((point) => {
            svgObj.circle(8).cx(point.x).cy(point.y).fill('#f00').stroke('#f00')
        })
    }

    // spine through the gridCenterPoints
    // points, tension, closeShape
    const splinePoints = spline(gridCenterPoints, cornerTension, closeShape)
    // draw a path through the spline points
    svgObj
        .path(splinePoints)
        .stroke({
            width: 2,
            color: '#000',
        })
        .fill('none')
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
            helpText: 'The number of points to draw',
        },
    }

    let quatTreeLevels = {
        sltype: 'sl-range',
        name: 'quatTreeLevels',
        options: {
            label: 'Max Quad Tree Levels',
            type: 'number',
            min: 0,
            max: 20,
            value: 10,
            step: 1,
            size: 'small',
            helpText: 'The number of quad tree levels',
        },
    }

    let cornerTension = {
        sltype: 'sl-range',
        name: 'cornerTension',
        options: {
            label: 'Corner Tension',
            type: 'number',
            min: 0,
            max: 10,
            value: 1,
            step: 0.1,
            size: 'small',
            helpText: 'The corner tension',
        },
    }

    let closeToggle = {
        sltype: 'sl-switch',
        name: 'closeShape',
        options: {
            label: 'Close Shape',
            size: 'medium',
            helpText: 'Close the shape',
            checked: true,
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
        quatTreeLevels,
        cornerTension,
        closeToggle,
        divider,
        resetSeedToggle,
        seed,
        divider,
        myDebugOptions
    )

    return mySettings
}
