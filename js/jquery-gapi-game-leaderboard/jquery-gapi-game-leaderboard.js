(function( $ ) {
    $.fn.gapiGameLeaderBoard = function(gapi, options) {
        var _this = this;
        var settings = $.extend({
            collection: 'PUBLIC',
            timeSpan: 'DAILY',
            maxResult: 10,
        }, options);

        var title = $('<div><a href="#">Leaderboard</a></div>');
        var leaderboards = null;
        title.appendTo(this);

        title.on('click', function(e) {
            if (!leaderboards) {
                leaderboards = $('<div>Beginner | Intermediate | Advanced</div>');
                leaderboards.appendTo(_this);
            }
            e.preventDefault();
        });

        return this;
    };
} ( jQuery ));
