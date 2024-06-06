// selenium
const { By } = require('selenium-webdriver');
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
                driver = await env
                    .builder()
                    .withCapabilities({ "acceptInsecureCerts": true })
                    .setFirefoxOptions(new firefox.Options().addArguments('--headless'))
                    .forBrowser('firefox')
                    .build();
            } else {
                driver = await env
                    .builder()
                    .withCapabilities({ "acceptInsecureCerts": true })
                    .forBrowser('firefox')
                    .build();
            }
        });

        after(async () => await driver.quit());

        step('Go to start page', async () => {
            await driver.get(config.url);
            assert.equal(await driver.getTitle(), 'Very Good Travel', 'Opening starting page failed');
        });

        step('Logging in', async () => {
            const loginButton = await driver.findElement(By.className('LoginBar__container'));
            await loginButton.click();
            assert.equal((await driver.getCurrentUrl()).toString().split('/').includes('login'), true, 'Moving to login page failed');

            const loginInput = await driver.findElement(By.id('login'));
            const passwordInput = await driver.findElement(By.id('password'));

            await loginInput.sendKeys(config.login);
            await passwordInput.sendKeys(config.password);

            const submitInput = await driver.findElement(By.css('[type="submit"]'));
            await submitInput.click();
            assert.equal((await driver.getCurrentUrl()).toString().split('/').includes('login'), false, 'Submitting login and password failed');
        });

        step('Logging out', async () => {
            const logoutButton = await driver.findElement(By.className('LoginBar__container'));
            const username = await logoutButton.findElement(By.className('LoginBar__container--login-text'));
            assert.equal(await username.getText(), config.login, 'Setting username failed');

            await logoutButton.click();
            const logoutLabel = await logoutButton.findElement(By.className('LoginBar__container--login-text'));
            assert.equal(await logoutLabel.getText(), 'Zaloguj się', 'Logging out failed');
        });

        step('Checking destinations menu', async () => {
            const anySelectionLabel = 'Wybierz miejsca wylotu';
            const destinationSelection = await driver.findElement(By.id('destination-selection'));
            const destinationMenu = await driver.findElement(By.id('destination-menu'));
            assert.equal(await destinationSelection.getText(), anySelectionLabel, '\'Any\' isn\'t set for destinations initially');
            assert.equal(await destinationMenu.isDisplayed(), false, 'Destination menu shouldn\'t be visible initially');

            await destinationSelection.click();
            assert.equal(await destinationMenu.isDisplayed(), true, 'Destination menu is not opening after click');

            const destinationItems = await destinationMenu.findElements(By.className('FilterListItem'));
            assert.notEqual(destinationItems.length, 0, 'No destinations found');

            const rootItem = (await destinationMenu.findElements(By.className('Root')))[0];
            const rootItemCheckbox = await rootItem.findElement(By.className('FilterListItem__item--checkbox'));
            assert.equal(await rootItem.getAttribute('open'), null, 'Destination shouldn\'t be open initially');
            assert.equal(await rootItemCheckbox.isSelected(), false, 'No destination should be checked initially');

            await rootItem.click();
            assert.equal(await rootItem.getAttribute('open'), 'true', 'Destination should be open after click');

            const leaves = await rootItem.findElements(By.className('Leaf'));
            const leafItem = leaves[0];
            const leafItemCheckbox = await leafItem.findElement(By.className('FilterListItem__item--checkbox'));
            const leafItemLabel = await leafItem.findElement(By.className('FilterListItem__item--label'));
            assert.equal(await leafItemCheckbox.isSelected(), false, 'No destination should be checked initially');

            await leafItemCheckbox.click();
            assert.equal(await leafItemCheckbox.isSelected(), true, 'Destination should be checked after click');
            assert.equal(await destinationSelection.getText(), await leafItemLabel.getText(), 'Destination should be set as selection after selecting it');

            await leafItemCheckbox.click();
            assert.equal(await leafItemCheckbox.isSelected(), false, 'Destination shouldn\'t be checked after deselecting');
            assert.equal(await destinationSelection.getText(), anySelectionLabel, 'Destination should be set as \'any\' after deselecting');

            await rootItemCheckbox.click();
            assert.equal(await rootItemCheckbox.isSelected(), true, 'Destination should be checked after click');
            assert.equal(await destinationSelection.getText(), `Wybrano ${leaves.length} ${leaves.length <= 4 ? 'lokalizacje' : 'lokalizacji'}`);
            leaves.forEach(async (leaf) => {
                assert.equal(await leaf.findElement('FilterListItem__item--checkbox').isSelected(), true, 'Subitems should be checked if root item is checked');
            });

            await rootItemCheckbox.click();
            assert.equal(await rootItemCheckbox.isSelected(), false, 'Destination shouldn\'t be checked after deselecting');
            assert.equal(await destinationSelection.getText(), anySelectionLabel);
            leaves.forEach(async (leaf) => {
                assert.equal(await leaf.findElement('FilterListItem__item--checkbox').isSelected(), false, 'Subitems shouldn\'t be checked if root item is deselected');
            });

            await rootItemCheckbox.click();
            await destinationSelection.click();
            assert.equal(await destinationMenu.isDisplayed(), false, 'Destination menu should be hidden after second click');
        });

        step('Checking date menu', async () => {
            const dateSelection = await driver.findElement(By.id('date-selection'));
            const dateMenu = await driver.findElement(By.id('date-menu'));
            assert.equal(await dateMenu.isDisplayed(), false, 'Date menu shouldn\'t be visible initially');

            const [startDateString, , endDateString] = (await dateSelection.getText()).split(' ');
            const [startDateDay, startDateMonth, startDateYear] = startDateString.split('.');
            const [endDateDay, endDateMonth, endDateYear] = endDateString.split('.');
            const startDate = new Date(startDateYear, startDateMonth - 1, startDateDay);
            const endDate = new Date(endDateYear, endDateMonth - 1, endDateDay);
            assert.equal(startDate.getTime() <= endDate.getTime(), true, 'Initial dates are incorrectly set');

            await dateSelection.click();
            assert.equal(await dateMenu.isDisplayed(), true, 'Date menu is not opening after click');

            const dayButtons = await dateMenu.findElements(By.className('vc-day-content'));
            assert.equal(dayButtons.length >= 28, true, 'Calendar has wrong amount of days available');
            await dayButtons[config.start_date_index].click();
            await dayButtons[config.end_date_index].click();

            const [newStartDateString, , newEndDateString] = (await dateSelection.getText()).split(' ');
            const [newStartDateDay, newStartDateMonth, newStartDateYear] = newStartDateString.split('.');
            const [newEndDateDay, newEndDateMonth, newEndDateYear] = newEndDateString.split('.');
            const newStartDate = new Date(newStartDateYear, newStartDateMonth - 1, newStartDateDay);
            const newEndDate = new Date(newEndDateYear, newEndDateMonth - 1, newEndDateDay);
            const newDateDayDifference = Math.round((newEndDate - newStartDate) / (1000 * 60 * 60 * 24));
            assert.equal(newStartDate.getTime() <= newEndDate.getTime(), true, 'New dates are incorrectly set');
            assert.equal(newDateDayDifference, config.end_date_index - config.start_date_index, 'Date range is not matching');

            await dayButtons[config.start_date_index].click();
            await dayButtons[config.start_date_index].click();
            const singleDateString = await dateSelection.getText();
            const [singleDateDay, singleDateMonth, singleDateYear] = singleDateString.split('.');
            const singleDate = new Date(singleDateYear, singleDateMonth - 1, singleDateDay);
            assert.equal(singleDate.getTime(), newStartDate.getTime(), 'Single date is not matching');
        });

        step('Checking origins menu', async () => {
            const anySelectionLabel = 'Wybierz miejsca wycieczki';
            const originSelection = await driver.findElement(By.id('origin-selection'));
            const originMenu = await driver.findElement(By.id('origin-menu'));
            assert.equal(await originSelection.getText(), anySelectionLabel, '\'Any\' isn\'t set for origins initially');
            assert.equal(await originMenu.isDisplayed(), false, 'Origin menu is visible initially');

            await originSelection.click();
            assert.equal(await originMenu.isDisplayed(), true, 'Origin menu is not opening after click');

            const originItems = await originMenu.findElements(By.className('FilterListItem'));
            assert.notEqual(originItems.length, 0, 'No origins found');

            const rootItem = (await originMenu.findElements(By.className('Root')))[0];
            const rootItemCheckbox = await rootItem.findElement(By.className('FilterListItem__item--checkbox'));
            assert.equal(await rootItem.getAttribute('open'), null, 'Origin shouldn\'t be open initially');
            assert.equal(await rootItemCheckbox.isSelected(), false, 'No origin should be checked initially');

            await rootItem.click();
            assert.equal(await rootItem.getAttribute('open'), 'true', 'Origin should be open after click');

            const leaves = await rootItem.findElements(By.className('Leaf'));
            const leafItem = leaves[0];
            const leafItemCheckbox = await leafItem.findElement(By.className('FilterListItem__item--checkbox'));
            const leafItemLabel = await leafItem.findElement(By.className('FilterListItem__item--label'));
            assert.equal(await leafItemCheckbox.isSelected(), false, 'No origin should be checked initially');

            await leafItemCheckbox.click();
            assert.equal(await leafItemCheckbox.isSelected(), true, 'Origin should be checked after click');
            assert.equal(await originSelection.getText(), await leafItemLabel.getText(), 'Origin should be set as selection after selecting it');

            await leafItemCheckbox.click();
            assert.equal(await leafItemCheckbox.isSelected(), false, 'Origin shouldn\'t be checked after deselecting');
            assert.equal(await originSelection.getText(), anySelectionLabel, 'Origin should be set as \'any\' after deselecting');

            await rootItemCheckbox.click();
            assert.equal(await rootItemCheckbox.isSelected(), true, 'Origin should be checked after click');
            assert.equal(await originSelection.getText(), `Wybrano ${leaves.length} ${leaves.length <= 4 ? 'lokalizacje' : 'lokalizacji'}`);
            leaves.forEach(async (leaf) => {
                assert.equal(await leaf.findElement('FilterListItem__item--checkbox').isSelected(), true, 'Subitems should be checked if root item is checked');
            });

            await rootItemCheckbox.click();
            assert.equal(await rootItemCheckbox.isSelected(), false, 'Origin shouldn\'t be checked after deselecting');
            assert.equal(await originSelection.getText(), anySelectionLabel);
            leaves.forEach(async (leaf) => {
                assert.equal(await leaf.findElement('FilterListItem__item--checkbox').isSelected(), false, 'Subitems shouldn\'t be checked if root item is deselected');
            });

            await rootItemCheckbox.click();
            await originSelection.click();
            assert.equal(await originMenu.isDisplayed(), false, 'Origin menu should be hidden after second click');
        });

        step('Checking participants menu', async () => {
            const participantsSelection = await driver.findElement(By.id('participants-selection'));
            const participantsMenu = await driver.findElement(By.id('participants-menu'));
            assert.equal(await participantsSelection.getText(), '1 osoba', 'Initial value for participants is wrong');
            assert.equal(await participantsMenu.isDisplayed(), false, 'Participants menu shouldn\'t be visible initially');

            await participantsSelection.click();
            assert.equal(await participantsMenu.isDisplayed(), true, 'Participants menu is not opening after click');

            const options = await participantsMenu.findElements(By.className('FilterOption'));
            assert.notEqual(options.length, 0, 'No participants options found');

            const adultOption = options[0];
            const adultOptionValue = await adultOption.findElement(By.className('FilterOption__bar--input'));
            const [adultOptionDecrease, adultOptionIncrease] = await adultOption.findElements(By.className('FilterOption__bar--button'));
            assert.equal(await adultOptionValue.getAttribute('value'), 1, 'Initial value of adult option should be 1');
            assert.equal(await adultOptionDecrease.isEnabled(), false, 'Decrease button should be disabled initially');
            assert.equal(await adultOptionIncrease.isEnabled(), true, 'Increase button should be enabled initially');

            while (await adultOptionIncrease.isEnabled()) {
                await adultOptionIncrease.click();
            }
            assert.notEqual(await adultOptionValue.getAttribute('value'), 1, 'Value at max shouldn\'t be 1');
            assert.equal(await adultOptionDecrease.isEnabled(), true, 'Decrease button should be disabled at max');
            assert.equal(await adultOptionIncrease.isEnabled(), false, 'Increase button should be enabled at max');
            assert.equal(await participantsSelection.getText(), `${await adultOptionValue.getAttribute('value')} ${await adultOptionValue.getAttribute('value') <= 4 ? 'osoby' : 'osób'}`, 'Selection value should match input number');

            while (await adultOptionDecrease.isEnabled()) {
                await adultOptionDecrease.click();
            }
            assert.equal(await adultOptionValue.getAttribute('value'), 1, 'Value at min shouldn\'t be 1');
            assert.equal(await adultOptionDecrease.isEnabled(), false, 'Decrease button should be disabled at min');
            assert.equal(await adultOptionIncrease.isEnabled(), true, 'Increase button should be enabled at min');
            assert.equal(await participantsSelection.getText(), '1 osoba', 'Selection value should match input number');

            while (await adultOptionIncrease.isEnabled()) {
                await adultOptionIncrease.click();
            }
        });

        step('Reset filters', async () => {
            const destinationSelection = await driver.findElement(By.id('destination-selection'));
            const dateSelection = await driver.findElement(By.id('date-selection'));
            const originSelection = await driver.findElement(By.id('origin-selection'));
            const participantsSelection = await driver.findElement(By.id('participants-selection'));
            assert.notEqual(await destinationSelection.getText(), 'Wybierz miejsca wylotu', 'Destination filter should be set to something other than \'any\'');
            const dateString = await dateSelection.getText();
            assert.notEqual(await originSelection.getText(), 'Wybierz miejsca wycieczki', 'Origin filter should be set to something other than \'any\'');
            assert.notEqual(await participantsSelection.getText(), '1 osoba', 'Participants filter should be set to something other than single person');

            const resetButton = await driver.findElement(By.className('FilterSearchBar__reset'));
            await resetButton.click();

            assert.equal(await destinationSelection.getText(), 'Wybierz miejsca wylotu', 'Destination filter should be reset to \'any\'');
            assert.notEqual(await dateSelection.getText(), dateString, 'Selected date didn\'t reset');
            assert.equal(await originSelection.getText(), 'Wybierz miejsca wycieczki', 'Origin filter should be reset to \'any\'');
            assert.equal(await participantsSelection.getText(), '1 osoba', 'Participants filter should be reset to single person');
        });

        step('Select search filters', async () => {
            const destinationSelection = await driver.findElement(By.id('destination-selection'));
            await destinationSelection.click();
            const destinationMenu = await driver.findElement(By.id('destination-menu'));
            const destinationRootItem = (await destinationMenu.findElements(By.className('Root')))[0];
            const destinationRootItemCheckbox = await destinationRootItem.findElement(By.className('FilterListItem__item--checkbox'));
            await destinationRootItemCheckbox.click();

            const originSelection = await driver.findElement(By.id('origin-selection'));
            await originSelection.click();
            const originMenu = await driver.findElement(By.id('origin-menu'));
            const originRootItem = (await originMenu.findElements(By.className('Root')))[0];
            const originRootItemCheckbox = await originRootItem.findElement(By.className('FilterListItem__item--checkbox'));
            await originRootItemCheckbox.click();
        });

        step('Go to offers list', async () => {
            const searchButton = await driver.findElement(By.className('FilterSearchBar__search-button'));
            await searchButton.click();
            assert.equal((await driver.getCurrentUrl()).toString().split('/').includes('offers'), true, 'Going to offers page failed');
            assert.equal((await driver.getCurrentUrl()).toString().split('/').pop(), 1, 'First page of offers wasn\'t selected');
        });

        step('Pagination tests', async () => {
            let [topPaginationBar, bottomPaginationBar] = await driver.findElements(By.className('PaginationBar'));
            assert.equal(await topPaginationBar.findElement(By.className('selected')).getText(), '1', 'Page 1 is missing from pagination bar');
            assert.equal(await bottomPaginationBar.findElement(By.className('selected')).getText(), '1', 'Page 1 is missing from pagination bar');

            const firstOffers = await driver.findElements(By.className('OfferCard'));
            assert.notEqual(firstOffers.length, 0, 'No offers found on page 1');

            let lastPageButton = (await topPaginationBar.findElements(By.className('PaginationBar__button'))).at(-2);
            const lastPageNumber = parseInt(await lastPageButton.getText());
            assert.equal(isNaN(lastPageNumber), false, 'There is no last page button');

            await lastPageButton.click();
            [topPaginationBar, bottomPaginationBar] = await driver.findElements(By.className('PaginationBar'));
            lastPageButton = (await topPaginationBar.findElements(By.className('PaginationBar__button'))).at(-2);
            assert.equal((await driver.getCurrentUrl()).toString().split('/').pop(), lastPageNumber.toString(), 'Last page of offers wasn\'t selected');
            assert.equal(await lastPageButton.getText(), lastPageNumber.toString(), 'Wrong pagination button is selected');
            assert.equal((await lastPageButton.getAttribute('class')).split(' ').includes('selected'), true, 'Last page button is not selected');

            const lastOffers = await driver.findElements(By.className('OfferCard'));
            assert.notEqual(lastOffers.length, 0, 'No offers found on last page');

            let firstPageButton = (await bottomPaginationBar.findElements(By.className('PaginationBar__button')))[1];
            assert.equal(parseInt(await firstPageButton.getText()), 1, 'There is no first page button');
            await firstPageButton.click();
        });

        step('Go to offer details', async () => {
            const offer = (await driver.findElements(By.className('OfferCard')))[0];
            const [locations, dates] = await offer.findElements(By.className('OfferCard__info--header-row-combo'));
            let [origin, , destination] = await locations.findElements(By.tagName('span'));
            origin = await origin.getText();
            destination = await destination.getText();
            let [start, , end] = (await dates.findElements(By.tagName('span')));
            start = await start.getText();
            end = await end.getText();
            const details = {
                origin: origin,
                destination: destination,
                start: start,
                end: end,
                extras: {},
            };
            [details.extras.bedroom, details.extras.transportation, details.extras.maintenance] = (await offer.findElements(By.className('OfferCard__info--content-column-detail'))).map(async (extra) => (await extra.getText()).trim());
            details.hotel = await offer.findElement(By.className('OfferCard__info--header-row-title')).getText();
            details.rating = await offer.findElement(By.className('StarBar__overlay')).getAttribute('style');
            details.price = await offer.findElement(By.className('OfferCard__info--content-column-price')).getText();

            const detailsButton = await offer.findElement(By.className('OfferCard__info--content-column-details'));
            await detailsButton.click();
            assert.equal((await driver.getCurrentUrl()).toString().split('/').includes('details'), true, 'Going to details page failed');

            const offerDetails = await driver.findElement(By.className('Details__content'));
            const [originDetails, , destinationDetails] = (await offerDetails.findElement(By.className('Details__content--summary-row-place')).getText()).split(' ');
            const [startDetails, , endDetails] = (await offerDetails.findElement(By.className('Details__content--summary-row-date')).getText()).split(' ');
            const offerData = {
                origin: originDetails,
                destination: destinationDetails,
                start: startDetails,
                end: endDetails,
                extras: {},
            };
            [offerData.extras.bedroom, offerData.extras.transportation, offerData.extras.maintenance] = (await offerDetails.findElements(By.className('Details__content--offer-row-detail'))).map(async (extra) => (await extra.getText()).trim());
            offerData.hotel = await offerDetails.findElement(By.className('Details__content--offer-row-title')).getText();
            offerData.rating = await offerDetails.findElement(By.className('StarBar__overlay')).getAttribute('style');
            offerData.price = await offerDetails.findElement(By.className('Details__content--summary-row-price')).getText();
            assert.deepStrictEqual(details, offerData, 'Offer list details doesn\'t match offer details data');
        });

        step('Checking offer purchase', async () => {
            const offerID = (await driver.getCurrentUrl()).toString().split('/').pop();
            const nonLoggedInpurchaseButton = await driver.findElement(By.className('Details__content--summary-row-button'));
            assert.equal(await nonLoggedInpurchaseButton.getText(), 'Zarezerwuj', 'Offer is unavailable');

            await nonLoggedInpurchaseButton.click();
            const goToLoginButton = await driver.findElement(By.css('[type="submit"]'));
            await goToLoginButton.click();

            assert.equal((await driver.getCurrentUrl()).toString().split('/').includes('login'), true, 'Moving to login page failed');
            const loginInput = await driver.findElement(By.id('login'));
            const passwordInput = await driver.findElement(By.id('password'));

            await loginInput.sendKeys(config.login);
            await passwordInput.sendKeys(config.password);

            const submitInput = await driver.findElement(By.css('[type="submit"]'));
            await submitInput.click();
            assert.equal((await driver.getCurrentUrl()).toString().split('/').includes('login'), false, 'Submitting login and password failed');
            assert.equal((await driver.getCurrentUrl()).toString().split('/').pop(), offerID, 'Returned to wrong page after logging from offer details');

            const purchaseButton = await driver.findElement(By.className('Details__content--summary-row-button'));
            await purchaseButton.click();

            const modalScreen = await driver.findElement(By.className('ModalScreen'));
            if (config.purchase_success) {
                const successModal = await modalScreen.findElement(By.className('PurchaseSuccessModal'));
                const purchaseReturnButton = await successModal.findElement(By.className('PurchaseSuccessModal__button'));
                await purchaseReturnButton.click();
            } else {
                const failureModal = await modalScreen.findElement(By.className('PurchaseFailureModal'));
                const purchaseReturnButton = await failureModal.findElement(By.className('PurchaseFailureModal__button'));
                await purchaseReturnButton.click();
            }
        });
    });
});
