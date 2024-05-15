# vgt-selenium-tests

## Project requirements

| Requirement | Version               |
|:-----------:|:---------------------:|
| Node.js     | ^21.7.1               |
| yarn        | ^1.22.21              |
| firefox     | non-snap installation |

## Project setup

```bash
yarn install
```

### Run tests with UI enabled

```bash
yarn test
```

### Run tests without UI enabled (headless)

*Headless tests are faster and less resource-intensive.*


```bash
yarn headless
```

## Tests configuration

Configuration is available in `package.json` in section **config**:

| **Config**       | **Explanation**                                                             |
|------------------|-----------------------------------------------------------------------------|
| url              | Base url to hosted web app                                                  |
| login            | Login used during login tests                                               |
| password         | Password used during login tests                                            |
| start_date_index | Date start number used during calendar tests *(best to set between (7-23))* |
| end_date_index   | Date end number used during calendar tests *(best to set between (7-23))*   |
| purchase_success | Whether we expect offer purchase to be succesful or not                     |

## Issues while running tests

### Firefox issues

```
Your Firefox profile cannot be loaded. It may be missing or inaccessible.
```

If Firefox throws this exception, it means you have snap installation of Firefox. Follow this [guide](https://www.omgubuntu.co.uk/2022/04/how-to-install-firefox-deb-apt-ubuntu-22-04) to reinstall firefox to non-snap installation.
