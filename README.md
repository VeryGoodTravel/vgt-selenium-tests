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

## Issues while running tests

### Firefox issues

```
Your Firefox profile cannot be loaded. It may be missing or inaccessible.
```

If Firefox throws this exception, it means you have snap installation of Firefox. Follow this [guide](https://www.omgubuntu.co.uk/2022/04/how-to-install-firefox-deb-apt-ubuntu-22-04) to reinstall firefox to non-snap installation.