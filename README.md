# pt-progress
Utilities to transfer the "Progress" sheet in "**Planning & Progress**" Excel spreadsheet to "**Assignments & Progress**" in Paratext.


## Setup
These utilities require installing Node.js and configuring Excel.

### Install Node.js
Download and install the latest LTS for Node.js
https://nodejs.org/en/download/


### Configuring Excel
1. Enable macros in "Planning &  Progress"
    1. From Excel --> File --> Options --> Customize Ribbon -> 
    2. In "Main Tabs", check "Developer" and hit "OK"

2. Add "Dictionary" for MS Visual Basic for Applications
    1. From Excel --> Developer --> click "Visual Basic" button to 
       access "MS Visual Basic for Applications"
    2. From MS Visual Basic for Applications --> Tools --> References...
    3. In "Available References:", check "Microsoft Scripting Runtime" and hit "OK"

------------------

## Usage

1. Run the macros in the "Progress and Planning" spreadsheet
2. `node index.js [Paratext user name] [progress file] [Paratext project path]`
