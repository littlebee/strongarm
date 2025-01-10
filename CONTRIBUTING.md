All contributors welcome.  All (mostly) contributions accepted.

## Setup

You'll need [Anaconda](https://docs.anaconda.com/anaconda/install/) installed.

Create an enviroment using conda_env_export.yml in the root:
```
conda env create -f conda_env_export.yml
```

## Development workflow

### code changes

Uses [flake8](https://flake8.pycqa.org/en/latest/) to lint contributions and provide autoformatting

### Changing dependencies

When changing python deps, please be sure an export the anaconda env.  From root working dir:
```
conda env export > conda_env_export.yml
```

### automated testing

Uses pytest for running tests.   The tests are capable of full integration testing.  The helpers in tests/helpers.  Use the functions in tests/helpers/start_stop.py to start and stop just the services needed for the given test module.   Services are started using the same scripts (start.sh and stop.sh) used to start them in production.

The only things we mock during testing are related to robot hardware specific things, for example, the [servo control lib](https://github.com/littlebee/strongarm/blob/79ba6f7243c4ec0955e1ae1eabb3a3f58b2f47bb/src/commons/servo.py#L11).

To run all tests:
```
./test tests/
```

To run a single test module:
```
./test tests/test_central_hub.py
```

To run a single test in a test module:
```
./test tests/test_strongarm.py -k test_angles_change
```


To debug issues during testing, logs for all of the services loaded by the failing module will be shown in the console.

Tips:
 - clear your terminal before running tests as test output for failing tests can be extensive
 - run all tests, clear terminal, and then individually run one failing module or specific test at a time so that you can see just the logs from as few failing tests as possible