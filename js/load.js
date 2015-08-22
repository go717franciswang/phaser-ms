var loadState = {
    preload: function() {
        //game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        game.scale.pageAlignHorizontally = true;

        game.load.spritesheet('tile', 'assets/tiles.png', 10, 10, 14);
        game.load.spritesheet('face', 'assets/faces.png', 20, 20, 3);
        game.load.image('wrench', 'assets/wrench.png', 20, 20);
        game.load.image('trophy', 'assets/trophy.png', 20, 20);
        game.load.image('back-arrow', 'assets/back-arrow.png', 20, 20);

        //  Load the Google WebFont Loader script
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    },

    create: function() {
        game.stage.smoothed = false;
        game.state.start('play');
    }
};
