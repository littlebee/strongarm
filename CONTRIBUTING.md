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

Uses pytest for running tests.   The tests are capable of full integration testing.  The helpers in tests/helpers,  will actually start central_hub and strongarm servers.

To run all tests:
```
pytest tests/
```

To debug issues during testing, see also
- logs/central_hub.py.log
- logs/strongarm.py.log