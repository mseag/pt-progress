// Copyright 2020 SIL International
// Types and utilities for handling book information

/**
 * 3-character book code that Paratext uses (from BookNames.xml).
 * "000" is a placeholder for book number 0 so that book number matches index.
 *       (not a valid Paratext book code)
 */
export type CodeType =
  // Placeholder
  "000" |

  // OT
  "GEN" | "EXO" | "LEV" | "NUM" | "DEU" |
  "JOS" | "JDG" | "RUT" | "1SA" | "2SA" | "1KI" | "2KI" | "1CH" | "2CH" |
  "EZR" | "NEH" | "EST" |
  "JOB" | "PSA" | "PRO" | "ECC" | "SNG" |
  "ISA" | "JER" | "LAM" | "EZK" | "DAN" |
  "HOS" | "JOL" | "AMO" | "OBA" | "JON" |
  "MIC" | "NAM" | "HAB" | "ZEP" | "HAG" | "ZEC" | "MAL" |

  // NT
  "MAT" | "MRK" | "LUK" |"JHN" |
  "ACT" | "ROM" | "1CO" | "2CO" |
  "GAL" | "EPH" | "PHP" | "COL" |
  "1TH" | "2TH" | "1TI" | "2TI" |
  "TIT" | "PHM" | "HEB" | "JAS" | "1PE" | "2PE" |
  "1JN" | "2JN" | "3JN" | "JUD" | "REV";

export interface bookType {
  code: CodeType;   // 3-character book code
  name: string;     // Book name
  num: number;      // Book number
  chapters: number; // Total number of chapters in the book
  verses: number;   // Total number of verses in the book
}

const bookInfo: bookType[] =
[
  {
    // Just a placeholder. Not a valid book
    code: "000",
    name: "Placeholder",
    num: 0,
    chapters: 0,
    verses: 0
  },

  // OT
  {
    code: "GEN",
    name: "Genesis",
    num: 1,
    chapters: 50,
    verses: 1533
  },
  {
    code: "EXO",
    name: "Exodus",
    num: 2,
    chapters: 40,
    verses: 1213
  },
  {
    code: "LEV",
    name: "Leviticus",
    num: 3,
    chapters: 27,
    verses: 859
  },
  {
    code: "NUM",
    name: "Numbers",
    num: 4,
    chapters: 36,
    verses: 1288
  },
  {
    code: "DEU",
    name: "Deuteronomy",
    num: 5,
    chapters: 34,
    verses: 959
  },
  {
    code: "JOS",
    name: "Joshua",
    num: 6,
    chapters: 24,
    verses: 658
  },
  {
    code: "JDG",
    name: "Judges",
    num: 7,
    chapters: 21,
    verses: 618
  },
  {
    code: "RUT",
    name: "Ruth",
    num: 8,
    chapters: 4,
    verses: 85
  },
  {
    code: "1SA",
    name: "1 Samuel",
    num: 9,
    chapters: 31,
    verses: 810
  },
  {
    code: "2SA",
    name: "2 Samuel",
    num: 10,
    chapters: 24,
    verses: 695
  },
  {
    code: "1KI",
    name: "1 Kings",
    num: 11,
    chapters: 22,
    verses: 816
  },
  {
    code: "2KI",
    name: "2 Kings",
    num: 12,
    chapters: 25,
    verses: 719
  },
  {
    code: "1CH",
    name: "1 Chronicles",
    num: 13,
    chapters: 29,
    verses: 942
  },
  {
    code: "2CH",
    name: "2 Chronicles",
    num: 14,
    chapters: 36,
    verses: 822
  },
  {
    code: "EZR",
    name: "Ezra",
    num: 15,
    chapters: 10,
    verses: 280
  },
  {
    code: "NEH",
    name: "Nehemiah",
    num: 16,
    chapters: 13,
    verses: 406
  },
  {
    code: "EST",
    name: "Esther",
    num: 17,
    chapters: 10,
    verses: 167
  },
  {
    code: "JOB",
    name: "Job",
    num: 18,
    chapters: 42,
    verses: 150
  },
  {
    code: "PSA",
    name: "Psalms",
    num: 19,
    chapters: 150,
    verses: 2461
  },
  {
    code: "PRO",
    name: "Proverbs",
    num: 20,
    chapters: 31,
    verses: 915
  },
  {
    code: "ECC",
    name: "Ecclesiastes",
    num: 21,
    chapters: 12,
    verses: 222
  },
  {
    code: "SNG",
    name: "Song of Songs",
    num: 22,
    chapters: 8,
    verses: 117
  },
  {
    code: "ISA",
    name: "Isaiah",
    num: 23,
    chapters: 66,
    verses: 1292
  },
  {
    code: "JER",
    name: "Jeremiah",
    num: 24,
    chapters: 52,
    verses: 1364
  },
  {
    code: "LAM",
    name: "Lamentations",
    num: 25,
    chapters: 5,
    verses: 154
  },
  {
    code: "EZK",
    name: "Ezekiel",
    num: 26,
    chapters: 48,
    verses: 1273
  },
  {
    code: "DAN",
    name: "Daniel",
    num: 27,
    chapters: 12,
    verses: 357
  },
  {
    code: "HOS",
    name: "Hosea",
    num: 28,
    chapters: 14,
    verses: 197
  },
  {
    code: "JOL",
    name: "Joel",
    num: 29,
    chapters: 3,
    verses: 73
  },
  {
    code: "AMO",
    name: "Amos",
    num: 30,
    chapters: 9,
    verses: 146
  },
  {
    code: "OBA",
    name: "Obadiah",
    num: 31,
    chapters: 1,
    verses: 21
  },
  {
    code: "JON",
    name: "Jonah",
    num: 32,
    chapters: 4,
    verses: 48
  },
  {
    code: "MIC",
    name: "Micah",
    num: 33,
    chapters: 7,
    verses: 105
  },
  {
    code: "NAM",
    name: "Nahum",
    num: 34,
    chapters: 3,
    verses: 47
  },
  {
    code: "HAB",
    name: "Habakkuk",
    num: 35,
    chapters: 3,
    verses: 56
  },
  {
    code: "ZEP",
    name: "Zephaniah",
    num: 36,
    chapters: 3,
    verses: 53
  },
  {
    code: "HAG",
    name: "Haggai",
    num: 37,
    chapters: 2,
    verses: 38
  },
  {
    code: "ZEC",
    name: "Zechariah",
    num: 38,
    chapters: 14,
    verses: 211
  },
  {
    code: "MAL",
    name: "Malachi",
    num: 39,
    chapters: 4,
    verses: 55
  },

  // NT
  {
    code: "MAT",
    name: "Matthew",
    num: 40,
    chapters: 28,
    verses: 1071
  },
  {
    code: "MRK",
    name: "Mark",
    num: 41,
    chapters: 16,
    verses: 678
  },
  {
    code: "LUK",
    name: "Luke",
    num: 42,
    chapters: 24,
    verses: 1151
  },
  {
    code: "JHN",
    name: "John",
    num: 43,
    chapters: 21,
    verses: 879
  },
  {
    code: "ACT",
    name: "Acts",
    num: 44,
    chapters: 28,
    verses: 1007
  },
  {
    code: "ROM",
    name: "Romans",
    num: 45,
    chapters: 16,
    verses: 433
  },
  {
    code: "1CO",
    name: "1 Corinthians",
    num: 46,
    chapters: 16,
    verses: 437
  },
  {
    code: "2CO",
    name: "2 Corinthians",
    num: 47,
    chapters: 13,
    verses: 257
  },
  {
    code: "GAL",
    name: "Galatians",
    num: 48,
    chapters: 6,
    verses: 149
  },
  {
    code: "EPH",
    name: "Ephesians",
    num: 49,
    chapters: 6,
    verses: 155
  },
  {
    code: "PHP",
    name: "Philippians",
    num: 50,
    chapters: 4,
    verses: 104
  },
  {
    code: "COL",
    name: "Colossians",
    num: 51,
    chapters: 4,
    verses: 95
  },
  {
    code: "1TH",
    name: "1 Thessalonians",
    num: 52,
    chapters: 5,
    verses: 89
  },
  {
    code: "2TH",
    name: "2 Thessalonians",
    num: 53,
    chapters: 3,
    verses: 47
  },
  {
    code: "1TI",
    name: "1 Timothy",
    num: 54,
    chapters: 6,
    verses: 113
  },
  {
    code: "2TI",
    name: "2 Timothy",
    num: 55,
    chapters: 4,
    verses: 83
  },
  {
    code: "TIT",
    name: "Titus",
    num: 56,
    chapters: 3,
    verses: 46
  },
  {
    code: "PHM",
    name: "Philemon",
    num: 57,
    chapters: 1,
    verses: 25
  },
  {
    code: "HEB",
    name: "Hebrews",
    num: 58,
    chapters: 13,
    verses: 303
  },
  {
    code: "JAS",
    name: "James",
    num: 59,
    chapters: 5,
    verses: 108
  },
  {
    code: "1PE",
    name: "1 Peter",
    num: 60,
    chapters: 5,
    verses: 105
  },
  {
    code: "2PE",
    name: "2 Peter",
    num: 61,
    chapters: 3,
    verses: 61
  },
  {
    code: "1JN",
    name: "1 John",
    num: 62,
    chapters: 5,
    verses: 105
  },
  {
    code: "2JN",
    name: "2 John",
    num: 63,
    chapters: 1,
    verses: 13
  },
  {
    code: "3JN",
    name: "3 John",
    num: 64,
    chapters: 1,
    verses: 14
  },
  {
    code: "JUD",
    name: "Jude",
    num: 65,
    chapters: 1,
    verses: 25
  },
  {
    code: "REV",
    name: "Revelation",
    num: 66,
    chapters: 22,
    verses: 404
  }
];

export class Books {

/**
   * Get the book information given the 3-character book code
   * @param {CodeType} bookCode
   * @returns {bookType}
   */
  public getBookByCode(bookCode: CodeType): bookType {
    const book : bookType = bookInfo.find(b => b.code === bookCode) as bookType;
    if (book === undefined) {
      console.error(`getBookByCode() failed for book code: ${bookCode}`);
      process.exit(1);
    }
    return book;
  }

  /**
   * Get the book information given the book name.
   * Also handles P&P typos / alternate spellings in book name
   * @param {string} name
   * @returns {bookType}
   */
  public getBookByName(name: string): bookType {
    let bookName: string;
    // Override P&P typos/alternate spellings in book name
    switch(name) {
      case 'Dueteronomy':
        bookName = 'Deuteronomy';
        break;
      case 'I Corinthians':
        bookName = "1 Corinthians";
        break;
      default:
        bookName = name;
    }
    const book : bookType = bookInfo.find(b => b.name === bookName) as bookType;
    if (book === undefined) {
      console.error(`Spreadsheet may have a typo for book name: ${name}. Exiting`);
      process.exit(1);
    }
    return book;
  }

  /**
   * Get the book information given the book number.
   * If an invalid book number given, return the placeholder
   * @param {number} bookNumber
   * @returns {bookType}
   */
  public getBookByNumber(bookNumber: number) : bookType {
    if (bookNumber < 1 || bookNumber > 66) {
      console.error(`getBookByNumber failed with book number: ${bookNumber}`);
      process.exit(1);
    }

    return bookInfo[bookNumber];
  }
}
