
# pt-progress
Utilities to transfer the "Progress" sheet in "**Planning & Progress**" Excel spreadsheet to "**Assignments & Progress**" in Paratext.

## Usage
Note for developers: Replace `pt-progress.exe` references with `node dist/index.js`.

### Extracting the Excel project status wthout updating Paratext
You will need the path to your project's Excel `.xlsm` file (relative to this project)

```bash
pt-progress.exe
    -x [path to Excel file]
```

This will extract the project's "Progress" worksheet and save it to a file named
*[Project name]*-*[Reporting Quarter]*-*[Reporting Year]*.json 

where the quarter is [Q1, Q2, Q3, Q4].

### Extract the Excel project status and updating Paratext
In addition to the Excel project's path, you will need a Parartext user name (that gets written to the status) and 
the full path to your corresponding Paratext project. By default,
the Paratext project will be updated with all the status information.If the optional quarter parameter is provided, only that matching quarter/year is updated in Paratext.

```bash
pt-progress.exe
    -x [path to Excel file] 
    -u [Paratext user name] 
    -q [quarter] 
    -p [Paratext project path]
````

Obtaining the pt-progress version:
```bash
pt-progress --version
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
Download and install the latest current version for Node.js ( > 13.0)

https://nodejs.org/en/download/current/

Install TypeScript globally via npm:
```
npm install -g typescript
```

After installing Node.js, open a command prompt to this directory and run the following:
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

### Publishing pt-progress.exe
This creates a standalone Windows executable `pt-progress.exe` so it can be run without Node.js

Install [pkg](https://www.npmjs.com/package/pkg) globally via npm:
```bash
npm install -g pkg
```

Create `pt-progress.exe`.
```bash
npm run-script publish
```

## License
Copyright (c) 2020 SIL International. All rights reserved.
Licensed under the [MIT license](LICENSE).