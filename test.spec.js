// selenium
const { Builder } = require('selenium-webdriver');
const { suite } = require('selenium-webdriver/testing');
const firefox = require('selenium-webdriver/firefox');
require('geckodriver');

// test utils
const { step } = require('mocha-steps');
const assert = require('assert');

// load configuration
const config = require('./package.json').config;

suite((env) => {
    describe('VeryGoodTravel - vgt-web-app', () => {
        let driver;

        before(async () => {
            if (process.env.HEADLESS === 'true') {
                driver = await new Builder()
                .withCapabilities({"acceptInsecureCerts": true})
                .setFirefoxOptions(new firefox.Options().headless())
                .forBrowser('firefox')
                .build();
            } else {
                driver = await new Builder()
                .withCapabilities({"acceptInsecureCerts": true})
                .forBrowser('firefox')
                .build();
            }
        });

        after(async () => await driver.quit());
    });
});