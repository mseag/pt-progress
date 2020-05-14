# pt-progress
Utilities to transfer the "Progress" sheet in "**Planning & Progress**" Excel spreadsheet to "**Assignments & Progress**" in Paratext.


## Setup
These utilities require configuring Excel and installing Node.js.

### Configuring Excel
1. Enable macros in "Planning &  Progress"
    1. From Excel --> File --> Options --> Customize Ribbon -> 
    2. In "Main Tabs", check "Developer" and hit "OK"

2. Add "Dictionary" for MS Visual Basic for Applications
    1. From Excel --> Developer --> click "Visual Basic" button to 
       access "MS Visual Basic for Applications"
    2. From MS Visual Basic for Applications --> Tools --> References...
    3. In "Available References:", check "Microsoft Scripting Runtime" and hit "OK"

### Install Node.js
Download and install the latest LTS for Node.js
https://nodejs.org/en/download/

After installing Node.js, open a command prompt to this directory and run the following:
```bash
npm install
```



------------------

## Usage

### Extracting the progress from Excel
1. Run the macros in the "Progress and Planning" spreadsheet
2. This will create the following files:
    1. books.json - JSON file containing book names, total number of chapters, and total number of verses
    2. [Project]-[Reporting Quarter]-[Reporting Year].json - JSON file for the quarter [Q1, Q2, Q3, Q4] and year containing project phases and completed chapters per book

### Use project status to update Paratext
Once the two files above have been generated, go to the command prompt:
```bash
node index.js [Paratext user name] [progress file] [Paratext project path]
````

For additional help:
```
node index.js -h
```
