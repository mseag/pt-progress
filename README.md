# pt-progress
Utilities to transfer the "Progress" sheet in "**Planning & Progress**" Excel spreadsheet to "**Assignments & Progress**" in Paratext.


## Developer Setup
These utilities require Node.js and TypeScript.

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

To rebuild the project
```bash
tsc
```
This compiles the TypeScript source files in `src/` into Javascript (`dist/`)

You can also have TypeScript watch the project and recompile automatically
```bash
tsc -w
```

------------------

## Usage

### Extracting the Excel project status
You will need the path to your project's Excel `.xlsm` file (relative to this project)

```bash
node dist/index.js -x [path to Excel file]
```

This will extract the project's "Progress" worksheet and save it to a file named
*[Project name]*-*[Reporting Quarter]*-*[Reporting Year]*.json where the quarter is [Q1, Q2, Q3, Q4].

### Extract the Excel project status and update Paratext
In addition to the Excel project's path, you will need a Parartext user name (that gets written to the status) and 
the full path to your corresponding Paratext project.

```bash
node dist/index.js -x [path to Excel file] -u [Paratext user name] -p [Paratext project path]
````

For additional help:
```
node dist/index.js -h
```
