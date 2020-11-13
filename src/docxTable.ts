// Copyright 2020 SIL International
// Utility to export ProjectStatusType to MS Word table
import * as fs from 'fs';
import * as path from 'path';
import {Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow } from 'docx';
//import * as officegen from 'officegen';
import { ProjectStatusType } from './status';

/**
 * Use the project status information to create MS Word table
 * @param {ProjectStatusType} progressObj - JSON object from the project status
 * @param {string} projectName - name of the project
 */
export function createTable(progressObj: ProjectStatusType, projectName: string): void {
  const doc = new Document();

  const table = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("Hello")],
          }),
          new TableCell({
            children: [new Paragraph("OK")],
          })
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("DONE")],
          }),
          new TableCell({
            children: [new Paragraph("World")],
          }),
        ],
      })
    ]
  });

  doc.addSection({
    children: [
      new Paragraph({
        text: "Hello World",
        heading: HeadingLevel.HEADING_1,
      }),
      table,
      new Paragraph({
        text: "OK"
      }),
    ],
  });

  Packer.toBuffer(doc).then((buffer) => {
    //fs.writeFileSync(path.join(projectName, ".docx"), buffer, { encoding: null} );
    fs.writeFileSync("My Little Table.docx", buffer);
  });
  console.warn("table created");
}
