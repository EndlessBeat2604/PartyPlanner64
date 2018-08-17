PP64.ns("adapters.boardinfo");

PP64.adapters.boardinfo.MP3 = (function() {
  // Chilly Waters - (U) ROM
  const MP3_CHILLY = PP64.adapters.boardinfo.create("MP3_CHILLY");
  MP3_CHILLY.name = "Chilly Waters";
  MP3_CHILLY.boardDefFile = 570;
  MP3_CHILLY.bgDir = 3;
  MP3_CHILLY.str = {
    boardSelect: [
      [21, 30],
      [26, 17],
    ],
    boardGreeting: [24, 12],
    boardGreetingDuel: [24, 0],
    boardNames: [
      [49, 39],
      [83, 43],
      // [93, 23], This is the songs list, so we can leave it
    ],
  };
  MP3_CHILLY.img = {
    boardSelectImg: 72,
    splashLogoImg: 22,
    splashLogoTextImg: 28,
    pauseLogoImg: 125,
    gateImg: 354, // dir 19
  };
  MP3_CHILLY.mainfsEventFile = [19, 618];
  MP3_CHILLY.eventASMStart = 0x00330000; // ballpark, but this is wrong -> // 0x0031E814; // is this 0x8011A490 ?
  MP3_CHILLY.eventASMEnd = 0x003320FC; // 0x8011C58C
  MP3_CHILLY.spaceEventsStartAddr = 0x0011E718;
  MP3_CHILLY.spaceEventsStartOffset = 0x00334288;
  MP3_CHILLY.spaceEventTables = [
    { upper: 0x31DBB8, lower: 0x31DBC0 }, // 0x80108048, 0x80108050, table 0x8011E2CC
    { upper: 0x31DBC4, lower: 0x31DBCC }, // 0x80108054, 0x8010805C, table 0x8011E718
    // { upper: 0x31DBD0, lower: 0x31DBD8 }, // 0x80108060, 0x80108068 // This is not a table actually, it is related to the happening spaces
    { upper: 0x31DBDC, lower: 0x31DBE4 }, // 0x8010806C, 0x80108074, table 0x8011E344
    // A table, but if we remove it Poison Shrooms break and probably other things
    // { upper: 0x31DBE8, lower: 0x31DBF0 }, // 0x80108078, 0x80108080, table 0x8011E4D8
  ];
  MP3_CHILLY.spaceEventsEndOffset = 0x00334428;
  MP3_CHILLY.starSpaceArrOffset = [0x00332E20, 0x00332E90]; // 0x8011D2B0, 0x8011D320
  MP3_CHILLY.starSpaceCount = 8;
  MP3_CHILLY.toadSpaceArrOffset = [0x00332E30, 0x00332EEC]; // 0x8011D2C0, 0x8011D37C
  MP3_CHILLY.bankArrOffset = [0x00333074]; // 0x8011D504
  MP3_CHILLY.bankCoinArrOffset = [0x00332F10]; // 0x8011D3A0
  MP3_CHILLY.bankCount = 2;
  MP3_CHILLY.itemShopArrOffset = [0x00333078]; // 0x8011D508
  MP3_CHILLY.itemShopCount = 2;
  MP3_CHILLY.booArrOffset = [0x00332F0C]; // 0x8011D39C
  MP3_CHILLY.booCount = 1;
  MP3_CHILLY.gateNeighborsOffset = [0x00332EE4]; // 0x8011D374
  MP3_CHILLY.gateArrOffset = [0x00332F8C]; // 0x8011D41C
  MP3_CHILLY.gateCount = 2;
  MP3_CHILLY.arrowRotStartOffset = 0x0031D8A8; // 0x80107D38
  MP3_CHILLY.arrowRotEndOffset = 0x0031D950; // 0x80107DDC
  MP3_CHILLY.audioIndexOffset = 0x0031DB92;
  MP3_CHILLY.onLoad = function(board) {
    board.otherbg.largescene = PP64.fs.hvqfs.readBackground(MP3_CHILLY.bgDir + 1).src;
  };
  MP3_CHILLY.onAfterOverwrite = function(romView, board) {
    // This code (right inbetween 800EBA60 calls) sets up a function pointer for happening spaces.
    // Since we don't use any default events, we can overwrite it.
    romView.setUint32(0x0031DBD0, 0);
    romView.setUint32(0x0031DBD4, 0);
    romView.setUint32(0x0031DBD8, 0); // Could also try to set this to 2484B960, and bump up eventASMStart past 8011A8D8
    // This current approach only works because of another patch in onAfterSave

    // Board specific calls
    //romView.setUint32(0x0031DB0C, 0); // Millenium star?
    //romView.setUint32(0x0031DB14, 0); // Something else important?
    //romView.setUint32(0x0031DB1C, 0);
    //romView.setUint32(0x0031DB24, 0);
    //romView.setUint32(0x0031DB2C, 0); // Skeleton key doors drawing. (I have a note about 0x80107FC4, YMMV)
    //romView.setUint32(0x0031DB34, 0); // Bank resources
    //romView.setUint32(0x0031DB3C, 0); // Item shop assets, draws toad on Z board overview
    //romView.setUint32(0x0031DB44, 0);

    // Banish the snowman assets to the dead space.
    romView.setUint16(0x0032E72E, board._deadSpace);
    romView.setUint16(0x0032E74E, board._deadSpace);
  };

  // Deep Bloober Sea - (U) ROM
  const MP3_BLOOBER = PP64.adapters.boardinfo.create("MP3_BLOOBER");
  MP3_BLOOBER.name = "Deep Bloober Sea";
  MP3_BLOOBER.boardDefFile = 571;
  MP3_BLOOBER.bgDir = 6;
  MP3_BLOOBER.str = {
    boardSelect: [
      [21, 31],
      [26, 18],
    ],
  };
  MP3_BLOOBER.img = {
    boardSelectImg: 73,
    splashLogoImg: 23,
    splashLogoTextImg: 29,
    gateImg: 359, // dir 19
  };
  // Works, but needs other values to parse right:
  // MP3_BLOOBER.spaceEventTables = [
  //   { upper: 0x003377C0, lower: 0x003377C8 }, // 0x80107B80, 0x80107B88, table 0x8011D688
  //   { upper: 0x003377CC, lower: 0x003377D4 }, // 0x80107B8C, 0x80107B94, table 0x8011D9CC
  //   // 0x800F8D48 call in between
  //   { upper: 0x003377E4, lower: 0x003377EC }, // 0x80107BA4, 0x80107BAC, table 0x8011D700
  //   { upper: 0x003377F0, lower: 0x003377F8 }, // 0x80107BB0, 0x80107BB8, table 0x8011D894
  // ];

  // Spiny Desert - (U) ROM
  const MP3_SPINY = PP64.adapters.boardinfo.create("MP3_SPINY");
  MP3_SPINY.name = "Spiny Desert";
  MP3_SPINY.boardDefFile = 572;
  MP3_SPINY.bgDir = 9;
  MP3_SPINY.str = {
    boardSelect: [
      [21, 32],
      [26, 19],
    ],
  };
  MP3_SPINY.img = {
    boardSelectImg: 74,
    splashLogoImg: 24,
    splashLogoTextImg: 30,
    gateImg: 366, // dir 19
  };

  // Woody Woods - (U) ROM
  const MP3_WOODY = PP64.adapters.boardinfo.create("MP3_WOODY");
  MP3_WOODY.name = "Woody Woods";
  MP3_WOODY.boardDefFile = 573;
  MP3_WOODY.bgDir = 12;
  MP3_WOODY.str = {
    boardSelect: [
      [21, 33],
      [26, 20],
    ],
  };
  MP3_WOODY.img = {
    boardSelectImg: 75,
    splashLogoImg: 25,
    splashLogoTextImg: 31,
    gateImg: 373, // dir 19
  };

  // Creepy Cavern - (U) ROM
  const MP3_CAVERN = PP64.adapters.boardinfo.create("MP3_CAVERN");
  MP3_CAVERN.name = "Creepy Cavern";
  MP3_CAVERN.boardDefFile = 574;
  MP3_CAVERN.bgDir = 15;
  MP3_CAVERN.str = {
    boardSelect: [
      [21, 34],
      [26, 21],
    ],
  };
  MP3_CAVERN.img = {
    boardSelectImg: 76,
    splashLogoImg: 26,
    splashLogoTextImg: 32,
  };

  // Waluigi's Land - (U) ROM
  const MP3_WALUIGI = PP64.adapters.boardinfo.create("MP3_WALUIGI");
  MP3_WALUIGI.name = "Waluigi's Land";
  MP3_WALUIGI.boardDefFile = 575;
  MP3_WALUIGI.bgDir = 18;
  MP3_WALUIGI.str = {
    boardSelect: [
      [21, 35],
      [26, 22],
    ],
  };
  MP3_WALUIGI.img = {
    boardSelectImg: 77,
    splashLogoImg: 27,
    splashLogoTextImg: 33,
  };

  // Gate Guy - (U) ROM
  const MP3U_GATEGUY = PP64.adapters.boardinfo.create("MP3U_GATEGUY");
  MP3U_GATEGUY.name = "Gate Guy";
  MP3U_GATEGUY.type = "DUEL";
  MP3U_GATEGUY.boardDefFile = 577;
  MP3U_GATEGUY.bgDir = 24;
  // MP3U_GATEGUY.str = {
  //   boardSelect: [
  //     [36, 21],
  //     [41, 27],
  //   ],
  //   boardNames: [
  //     [49, 45],
  //     [39, 1],
  //     [83, 49],
  //   ],
  // };
  MP3U_GATEGUY.img = {
    boardSelectImg: 81,
    splashLogoImg: 34,
    splashLogoTextImg: 40,
    miniMapWithBg: 279, // dir 19
    miniMapDots: 280,
  };
  MP3U_GATEGUY.spaceEventsStartAddr = 0x00118914;
  MP3U_GATEGUY.spaceEventsStartOffset = 0x003EBA04;
  MP3U_GATEGUY.spaceEventTables = [ // JAL 800EA46C
    { upper: 0x3E0BAC, lower: 0x3E0BB4 }, // 0x8010DABC, 0x8010DAC4, table 0x80118914
    { upper: 0x3E0BB8, lower: 0x3E0BC0 }, // 0x8010DAC8, 0x8010DAD0, table 0x80118DEC
  ];
  MP3U_GATEGUY.onAfterOverwrite = function(romView, board) {
    // TODO Need this for duels?
    // This code (right inbetween 800EBA60 calls) sets up a function pointer for happening spaces.
    // Since we don't use any default events, we can overwrite it.
    // romView.setUint32(, 0);
    // romView.setUint32(, 0);
    // romView.setUint32(, 0);

    // TODO: Probably some stuff to NOP around 0x8010DA9C
  };

  // Arrowhead - (U) ROM
  const MP3U_ARROWHEAD = PP64.adapters.boardinfo.create("MP3U_ARROWHEAD");
  MP3U_ARROWHEAD.name = "Arrowhead";
  MP3U_ARROWHEAD.type = "DUEL";
  MP3U_ARROWHEAD.boardDefFile = 578;
  MP3U_ARROWHEAD.bgDir = 25;
  MP3U_ARROWHEAD.img = {
    boardSelectImg: 82,
    splashLogoImg: 35,
    splashLogoTextImg: 41,
    miniMapWithBg: 310, // dir 19
    miniMapDots: 311,
  };

  // Pipesqueak - (U) ROM
  const MP3U_PIPESQUEAK = PP64.adapters.boardinfo.create("MP3U_PIPESQUEAK");
  MP3U_PIPESQUEAK.name = "Pipesqueak";
  MP3U_PIPESQUEAK.type = "DUEL";
  MP3U_PIPESQUEAK.boardDefFile = 579;
  MP3U_PIPESQUEAK.bgDir = 26;
  MP3U_PIPESQUEAK.img = {
    boardSelectImg: 83,
    splashLogoImg: 36,
    splashLogoTextImg: 42,
    miniMapWithBg: 312, // dir 19
    miniMapDots: 313,
  };

  // Blowhard - (U) ROM
  const MP3U_BLOWHARD = PP64.adapters.boardinfo.create("MP3U_BLOWHARD");
  MP3U_BLOWHARD.name = "Blowhard";
  MP3U_BLOWHARD.type = "DUEL";
  MP3U_BLOWHARD.boardDefFile = 580;
  MP3U_BLOWHARD.bgDir = 27;
  MP3U_BLOWHARD.img = {
    boardSelectImg: 84,
    splashLogoImg: 37,
    splashLogoTextImg: 43,
    miniMapWithBg: 315, // dir 19
    miniMapDots: 316,
  };

  // Mr. Mover - (U) ROM
  const MP3U_MRMOVER = PP64.adapters.boardinfo.create("MP3U_MRMOVER");
  MP3U_MRMOVER.name = "Mr. Mover";
  MP3U_MRMOVER.type = "DUEL";
  MP3U_MRMOVER.boardDefFile = 581;
  MP3U_MRMOVER.bgDir = 28;
  MP3U_MRMOVER.img = {
    boardSelectImg: 85,
    splashLogoImg: 38,
    splashLogoTextImg: 44,
    miniMapWithBg: 317, // dir 19
    miniMapDots: 318,
  };

  // Backtrack - (U) ROM
  const MP3U_BACKTRACK = PP64.adapters.boardinfo.create("MP3U_BACKTRACK");
  MP3U_BACKTRACK.name = "Backtrack";
  MP3U_BACKTRACK.type = "DUEL";
  MP3U_BACKTRACK.boardDefFile = 582;
  MP3U_BACKTRACK.bgDir = 29;
  MP3U_BACKTRACK.img = {
    boardSelectImg: 86,
    splashLogoImg: 39,
    splashLogoTextImg: 45,
    miniMapWithBg: 319, // dir 19
    miniMapDots: 320,
  };

  return {
    getBoardInfos: function(gameID) {
      switch(gameID) {
        case $gameType.MP3_USA:
          return [
            MP3_CHILLY,
            MP3_BLOOBER,
            MP3_SPINY,
            MP3_WOODY,
            MP3_CAVERN,
            MP3_WALUIGI,

            MP3U_GATEGUY,
            MP3U_ARROWHEAD,
            MP3U_PIPESQUEAK,
            MP3U_BLOWHARD,
            MP3U_MRMOVER,
            MP3U_BACKTRACK,
          ];
      }
    }
  };
})();
/*
    {
      "name": "Training?",
      "fileNum": 576,
      "bgNum": 21,
    },
    {
      "name": "Gate Guy",
      "fileNum": 577,
      "bgNum": 24,
    },
    {
      "name": "Arrowhead",
      "fileNum": 578,
      "bgNum": 25,
    },
    {
      "name": "Pipesqueak",
      "fileNum": 579,
      "bgNum": 26,
    },
    {
      "name": "Blowhard",
      "fileNum": 580,
      "bgNum": 27,
    },
    {
      "name": "Mr. Mover",
      "fileNum": 581,
      "bgNum": 28,
    },
    {
      "name": "Backtrack",
      "fileNum": 582,
      "bgNum": 29,
    },
    {
      "name": "mystery",
      "fileNum": 583,
      "bgNum": 30,
    },
  ];
*/
