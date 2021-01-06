
# pt-progress
Utilities to transfer a project's quarterly report status from an MS Office document of either:
  * "Progress" sheet from a "**Planning & Progress**" Excel spreadsheet
  * MS Word file

to the corresponding "**Assignments & Progress**" in Paratext.

Reference: [Setting up for Progress](https://paratext.org/2018/01/31/setting-up-for-progress-tracking/).

## Usage
Note for developers: Replace `pt-progress.exe` references with `node dist/index.js`.

-----

### Extracting the MS Word project status from a table (does not update Paratext)
This process uses an Excel macro to copy a Word table and save the info to a [JSON status file](#json-status-file).
1. Open "Imported Reports.xlsm" in Excel and follow the instructions on the *README* sheet to enable macros
2. Delete any sheets generated from previous runs (they'll have project names)
3. From the *Setup* sheet, enter the following information (blue shaded fields) 
    a. Browse for the Word `.docx` file to import. If you get an error, make sure the Word file is closed.
    b. Enter the project names. If there are multiple progress tables in the Word doc, enter the project names in that order. (comma-separated)
    c. Enter the reporting quarter (Q1, Q2, Q3, Q4)
    d. Enter the fiscal reporting year (4 digits)
    e. Click the "Export Quarterly Report Status" button.
4. If there's no errors, the macro will generate a JSON status file for each table in the Word doc.


Note on completed status in the table (marked with an "x"): 
If quarter / year aren't specified, an arbitrary value "Q1" / 2017 is assigned.

----

### JSON Status file
The JSON status file has a name
*[Project name]*-*[Reporting Quarter]*-*[Reporting Year]*.json where:

*[Project name]* - Name as defined in the "Planning" sheet or macro prompt.

*[Reporting Quarter]* - Fiscal quarter is one of [Q1, Q2, Q3, Q4] 

*[Reporting Year]* - Fiscal year (4 digits) as defined in the "Progress" sheet or macro prompt.

This file is generated by extracting project status from one of the Office documents above.

### Use a JSON status file to update Paratext

Command-line:
```bash
pt-progress.exe
    -j [path to JSON status file] 
    -u [Paratext user name] 
    -p [Paratext project path]
```

You can also use the "Imported Reports.xlsm" file
1. From the *Setup* sheet, enter the following information (green shaded fields)
    a. Paratext username which will appear in the "Assignments and Progress" status
    b. Location of Paratext project's folder
    c. Location of JSON status file (generated from the "Export Quarterly Report Status" button above)
    d. Location of the pt-progress.exe file
    e. Click the "Update Paratext Progress" button
2. If there are no errors, the macro will update the Paratext progress

-----

### Extracting the Excel project planning status without updating Paratext
You will need the path to your project's Excel `.xlsm` file (relative to this pt-progress directory)

Command-line:
```bash
pt-progress.exe
    -x [path to Excel file]
```

This will extract the project's "Progress" worksheet and save it to a [JSON status file](#json-status-file).

### Extracting the Excel project status and updating Paratext
In addition to the Excel project's path, you will need a Paratext user name (that gets written to the status) and 
the full path to your corresponding Paratext project. By default,
the Paratext project will be updated with all the status information. 
If the optional quarter parameter is provided, only that matching quarter/year is updated in Paratext.

```bash
pt-progress.exe
    -x [path to Excel file] 
    -u [Paratext user name] 
    -q [quarter] 
    -p [Paratext project path]
```

----

### Extracting the Paratext project status and export to MS Word table (does not update Paratext)
This process parses the Paratext project\'s xml status to a JSON status file
and exports it to MS Word table. Note: This feature is not fully implemented yet.

The JSON status file has a name
*[Project name]*-progress-export.json

```bash
pt-progress.exe
    -p [Paratext project path]
    -t 
```



### Help
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
These utilities require MS Excel, Word, Git, Node.js, and TypeScript (installed locally).

### Install Git
Download and install Git

https://git-scm.com/downloads

### Install Node.js and Dependencies
Download and install the latest current version for Node.js (>=14.15.0)

https://nodejs.org/en/download/current/

After installing Node.js, reboot your PC, open Git Bash to this directory and install this project's dependencies:
```bash
npm install
```

This will install [TypeScript](https://www.typescriptlang.org/) locally and can be accessed with

```bash
npx tsc
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
This optional step creates a standalone Windows executable `pt-progress.exe` so it can be run without Node.js. Published artifacts will be in the `deploy/` directory.

```bash
npm run-script publish
```

This copies the required `node_expat.node` file that must be distributed with the generated executable `pt-progress.exe`.

-------------

## License
Copyright (c) 2020-2021 SIL International. All rights reserved.
Licensed under the [MIT license](LICENSE).