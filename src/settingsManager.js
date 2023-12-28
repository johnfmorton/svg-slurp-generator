// settingsComponent.js

import { SlInput, SlRange, SlSwitch, SlDivider } from '@shoelace-style/shoelace'

export class SettingsManager {
    constructor() {
        this.settingsContainer = null
        this.settings = {}
    }

    init({ settingsElement }) {
        this.settingsContainer = document.querySelector(settingsElement)
    }

    addSetting(settingConfig) {
        // throw error is kebab case is used
        if (settingConfig.name && settingConfig.name.includes('-')) {
            throw new Error(
                'The name `' +
                    settingConfig.name +
                    '` must not contain a hypen. Use camelCase instead to create a valid variable name.'
            )
        }

        const { sltype, name, options } = settingConfig

        let settingElement = document.createElement(sltype)

        // if this is an sl-divider, we don't need to set any properties
        if (sltype !== 'sl-divider') {
            for (let [key, value] of Object.entries(options)) {
                if (value !== null) {
                    // Only set non-null properties

                    // before we use the passed in value, check if there is a query param with the same name
                    // if so, use that value instead
                    const url = new URL(window.location.href)
                    const urlValue = url.searchParams.get(name)
                    if (urlValue !== null) {
                        // if the type of shoelace component is a switch, we need set the checked property instead of value
                        if (
                            sltype === 'sl-switch' ||
                            sltype === 'sl-checkbox'
                        ) {
                            if (key === 'checked') {
                                value = urlValue === 'true'
                            }
                        } else if (key === 'value') {
                            value = urlValue
                        }
                    }
                    settingElement[key] = value
                }
                // some shoelace components use innerText instead of label
                if (key === 'label') {
                    settingElement.innerText = value
                }
            }

            this.settings[name] = settingElement

            // Define a getter for direct property access
            // be sure this is not a dubplicate property
            if (this.hasOwnProperty(name)) {
                throw new Error(`The name ${name} is already in use.`)
            }

            Object.defineProperty(this, name, {
                get: () => this.getSettingValue(name),
                set: (value) => {
                    this.settings[name].value = value;
                    // save this value as a query param
                    setParam(name, value)
                }
            })
        }
      this.settingsContainer.appendChild(settingElement)

      // add a listener to the setting to record the value in as a query param to be restored on page reload

        settingElement.addEventListener('sl-change', () => {
            setParam(name, this.getSettingValue(name))
        })
    }

    add(...settingConfigs) {
        settingConfigs.forEach((config) => this.addSetting(config))
    }

    getSettingValue(settingName) {
        if (!this.settings[settingName]) {
            throw new Error(`Setting ${settingName} not found.`)
        }

      // if the setting is a number, cast it to a number
        if (this.settings[settingName].type === 'number') {
            return Number(this.settings[settingName].value)
        }

        return (
            this.settings[settingName].value ??
            this.settings[settingName].checked ??
            null
        )
    }
}

function setParam(name, value) {
    const url = new URL(window.location.href)
    url.searchParams.set(name, value)
    window.history.replaceState({}, '', url)
}


export const mySettings = new SettingsManager()
