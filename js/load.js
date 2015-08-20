var loadState = {
    preload: function() {
        game.load.spritesheet('tile', 'assets/tiles.png', 10, 10, 14);
        game.load.spritesheet('face', 'assets/faces.png', 20, 20, 3);
        game.load.image('wrench', 'assets/wrench.png', 20, 20);

        //  Load the Google WebFont Loader script
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    },

    create: function() {
        game.state.start('play');
    }
};
