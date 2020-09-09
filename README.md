
# pt-progress
Utilities to transfer the "Progress" sheet from a "**Planning & Progress**" Excel spreadsheet to "**Assignments & Progress**" in Paratext.

Reference: [Setting up for Progress](https://paratext.org/2018/01/31/setting-up-for-progress-tracking/).

## Usage
Note for developers: Replace `pt-progress.exe` references with `node dist/index.js`.

### Extracting the Excel project status wthout updating Paratext
You will need the path to your project's Excel `.xlsm` file (relative to this pt-progress directory)

```bash
pt-progress.exe
    -x [path to Excel file]
```

This will extract the project's "Progress" worksheet and save it to a file named
*[Project name]*-*[Reporting Quarter]*-*[Reporting Year]*.json.

*[Project name]* is defined in the "Planning" sheet.

*[Reporting Quarter]* (one of [Q1, Q2, Q3, Q4]) and *[Reporting Year]* are defined in the "Progress" sheet.

### Extract the Excel project status and updating Paratext
In addition to the Excel project's path, you will need a Paratext user name (that gets written to the status) and 
the full path to your corresponding Paratext project. By default,
the Paratext project will be updated with all the status information. If the optional quarter parameter is provided, only that matching quarter/year is updated in Paratext.

```bash
pt-progress.exe
    -x [path to Excel file] 
    -u [Paratext user name] 
    -q [quarter] 
    -p [Paratext project path]
````

Obtaining the pt-progress version:
```bash
pt-progress.exe --version
```

For additional help:
```bash
pt-progress.exe -h
```

------------------

## Developer Setup
These utilities require Git, Node.js and TypeScript.

### Install Git
Download and install Git

https://git-scm.com/downloads

### Install Node.js and TypeScript
Download and install the latest current version for Node.js (>13.0)

https://nodejs.org/en/download/current/

After installing Node.js, reboot your PC, open Git Bash to this directory and install [TypeScript](https://www.typescriptlang.org/) globally via npm:
```
npm install -g typescript
```

Then install this project's dependencies:
```bash
npm install
```

### Compiling pt-progress
This compiles the TypeScript source files in `src/` into Javascript (`dist/`)

To rebuild the project
```bash
npm run-script build
```

You can also have TypeScript watch the project and recompile automatically
```bash
npm run-script watch
```

### Debugging with Visual Studio Code
Open Folder as a VS Code Project

Edit your applicable parameters in [launch.json](./.vscode/launch.json). If using Windows paths, you'll need to escape the slashes (e.g. `-p "C:\\somewhere\\to\\paratext-project"`)

### Publishing pt-progress.exe
This optional step creates a standalone Windows executable `pt-progress.exe` so it can be run without Node.js.

Install [pkg](https://www.npmjs.com/package/pkg) globally via npm:
```bash
npm install -g pkg
```

Create `pt-progress.exe`.
```bash
npm run-script publish
```

-------------

## License
Copyright (c) 2020 SIL International. All rights reserved.
Licensed under the [MIT license](LICENSE).