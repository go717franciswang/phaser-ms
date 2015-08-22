var achievementState = {
    create: function() {
        var _this = this;

        backArrow = game.add.sprite(50, 50, 'back-arrow');
        backArrow.scale.setTo(2,2);
        backArrow.anchor.setTo(0.5, 0.5);
        backArrow.inputEnabled = true;
        backArrow.events.onInputDown.add(function() {
            game.state.start('play');
        }, this);

        var textStyle = { font: "56px VT323", fill: "#000000" };
        var title = game.add.text(game.width/2, 50, 'Achievements', textStyle);
        title.anchor.setTo(0.5, 0.5);

        this.loadAchievementDefinitions(function() {
            _this.loadAchievements();
        });
    },

    loadAchievementDefinitions: function(callback) {
        var _this = this;
        var request = gapi.client.games.achievementDefinitions.list();
        
        request.execute(function(response) {
            _this.achievementDefinition = _this.achievementDefinition || {};

            for (var i = 0; i < response.items.length; i++) {
                _this.achievementDefinition[response.items[i].id] = response.items[i];
            }

            callback();
        });
    },

    loadAchievements: function() {
        var _this = this;
        var request = gapi.client.games.achievements.list({playerId: 'me'});
        var textStyle = { font: "28px VT323", fill: "#000000" };
        var greyTextStyle = { font: "28px VT323", fill: "#8D8D8D" };

        request.execute(function(response) {
            console.log(response);

            if (response.hasOwnProperty('items')) {
                for (var i = 0; i < response.items.length; i++) {
                    var id = response.items[i].id;
                    var ach = _this.achievementDefinition[id];

                    var style = greyTextStyle;
                    if (response.items[i].achievementState == 'UNLOCKED') {
                        style = textStyle;
                    }

                    var t = game.add.text(game.width/2, 100+i*50, ach.name + ': ' + ach.description, style);
                    t.anchor.setTo(0.5, 0);
                }
            } else {
                var t = game.add.text(game.width/2, 100, 'You have not unlocked any achievements', style);
                t.anchor.setTo(0.5, 0);
            }
        });
    },
};
