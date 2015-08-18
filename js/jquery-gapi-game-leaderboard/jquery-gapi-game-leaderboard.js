(function( $ ) {
    $.fn.gapiGameLeaderBoard = function(gapi, options) {
        var _this = this;
        var settings = $.extend({
            collection: 'PUBLIC',
            timeSpan: 'DAILY',
            maxResult: 10,
            leaderboardId: null
        }, options);

        var title = $('<div><a href="#">Leaderboard</a></div>');
        var leaderboards = null;
        var leaderboardsUI;
        var collectionUI;
        var timespanUI;
        var scoreboardUI;

        title.on('click', function(e) {
            if (!leaderboards) {
                leaderboardsUI = $('<div></div>');
                leaderboardsUI.appendTo(_this);

                // https://developers.google.com/games/services/web/api/leaderboards
                var req = gapi.client.games.leaderboards.list({
                    maxResults: 5
                });

                req.execute(function(response) {
                    leaderboards = response.items;
                    var tags = [];

                    $.each(response.items, function(i, leaderboard) {
                        tags.push('<span>'+leaderboard.name+'</span>');
                        if (i == 0 && settings.leaderboardId === null) {
                            settings.leaderboardId = leaderboard.id;
                        }
                    });

                    collectionUI = $('<div>Public | Social</div>');
                    timespanUI = $('<div>Daily | Weekly | All Time</div>');
                    scoreboardUI = $('<div></div>');

                    $(tags.join(' | ')).appendTo(leaderboardsUI);
                    collectionUI.appendTo(leaderboardsUI);
                    timespanUI.appendTo(leaderboardsUI);
                    scoreboardUI.appendTo(leaderboardsUI);
                    updateScoreBoard();
                });
            } else {
                updateScoreBoard();
            }

            e.preventDefault();
        });

        title.appendTo(this);

        var updateScoreBoard = function() {
            // https://developers.google.com/games/services/web/api/scores/list
            var req = gapi.client.games.scores.list({
                collection: settings.collection,
                leaderboardId: settings.leaderboardId,
                timeSpan: settings.timeSpan,
                maxResults: settings.maxResults,
            });

            req.execute(function(response) {
                scoreboardUI.empty();

                var table = $('<table><tr>'
                              +'<th>Rank</th>'
                              +'<th>Player</th>'
                              +'<th>Score</th>'
                              +'<th>Date</th>'
                              +'</tr></table>');
                table.appendTo(scoreboardUI);

                var appendScore = function(score) {
                    var rank = score.formattedScoreRank ? score.formattedScoreRank : 'Private';
                    var row = $('<tr>'
                                +'<td>'+rank+'</td>'
                                +'<td>'+score.player.displayName+'</td>'
                                +'<td>'+score.formattedScore+'</td>'
                                +'<td>'+new Date(parseInt(score.writeTimestampMillis)).toLocaleString()+'</td>'
                                +'</tr>');
                    row.appendTo(table);
                };

                appendScore(response.playerScore);
                if (response.items) {
                    $.each(response.items, function(i, score) {
                        appendScore(score);
                    });
                }
            });
        };

        return this;
    };
} ( jQuery ));
