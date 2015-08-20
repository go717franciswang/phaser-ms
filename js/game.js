var game = new Phaser.Game(900, 600, Phaser.AUTO, 'container');
var googleFontReady = false;

WebFontConfig = {

  //  'active' means all requested fonts have finished loading
  //  We set a 1 second delay before calling 'createText'.
  //  For some reason if we don't the browser cannot render the text the first time it's created.
  //active: function() { game.time.events.add(Phaser.Timer.SECOND / 2, createText, this); },
  active: function() { googleFontReady = true },

  //  The Google Fonts we want to load (specify as many as you like in the array)
  google: {
    families: ['VT323']
  }

};

game.state.add('load', loadState);
game.state.add('play', playState);
game.state.start('load');

var MODES = {
    TEST: { width: 9, height: 9, mineCount: 3 },
    BEGINNER: { 
        width: 9,
        height: 9,
        mineCount: 10,
        leaderboardId: 'CgkI5MXwiscWEAIQAA'
    },
    INTERMEDIATE: { 
        width: 16, 
        height: 16,
        mineCount: 40,
        leaderboardId: 'CgkI5MXwiscWEAIQAQ'
    },
    ADVANCED: { 
        width: 30,
        height: 16,
        mineCount: 99,
        leaderboardId: 'CgkI5MXwiscWEAIQAg'
    },
};

var mode = MODES.BEGINNER;
var width;
var height;
var mineCount;
var mineMap;
var tileScale = 3;
var firstClick;
var previousClickTime = 0;
var previousClickTile = null;
var tileGroup;
var knownCount;
var flaggedCount;
var gameStartTimestamp;
var gameOver = false;
var face;
var wrench;

var textTimeElapsed;
var textMinesLeft;

var FRAME = {
  KNOWN: 0,
  UNKNOWN: 1,
  FLAG: 2,
  MINE: 3
};

var userSignedIn = false;
var googleServiceReady = false;
var configDialog;

function signinCallback(authResult) {
  if (authResult.status.signed_in) {
    document.getElementById('signInButton').style.display = 'none';
    userSignedIn = true;

    gapi.client.load('games','v1',function(response) {
      googleServiceReady = true;
    });
  }
}

$('#leaderBoard').gapiGameLeaderBoard(gapi, {});
