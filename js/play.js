var playState = {
    create: function() {
        if (googleFontReady) {
            this.createText();
        } else {
            setTimeout(this.createText, 1000);
        }

        width = mode.width;
        height = mode.height;
        mineCount = mode.mineCount;
        game.stage.backgroundColor = '#e8e8e8';
        if (tileGroup) {
            tileGroup.pendingDestroy = true;
        }

        tileGroup = game.add.group();

        mineMap = this.genEmptyMineMap(width, height);
        knownCount = 0;
        flaggedCount = 0;
        gameOver = false;
        firstClick = true;
        gameStartTimestamp = null;

        face = game.add.sprite(game.width/2, 90, 'face', 0);
        face.scale.setTo(2,2);
        face.anchor.setTo(0.5, 0.5);
        face.inputEnabled = true;
        face.input.priorityID = 0;
        face.events.onInputDown.add(function() {
            face.frame = 0;
            game.state.start('play');
        }, this);

        wrench = game.add.sprite(game.width - 50, 50, 'wrench');
        wrench.scale.setTo(2,2);
        wrench.anchor.setTo(0.5, 0.5);
        wrench.inputEnabled = true;
        wrench.events.onInputDown.add(function() {
            if (configDialog) {
                configDialog.pendingDestroy = true;
                configDialog = null;
            } else {
                var w = game.width - 120;
                var h = game.height - 120;
                configDialog = game.add.group();
                var graphics = game.add.graphics((game.width-w)/2, (game.height-h)/2);
                graphics.beginFill(0xFFFFFF);
                configDialog.add(graphics);

                // background
                var bg = graphics.drawRoundedRect(0, 0, w, h, 50);
                bg.inputEnabled = true;
                bg.input.priorityID = 1;

                // buttons
                var bw = 200;
                var bh = 60;
                var createButton = function(x, y, name, newMode) {
                    var graphics = game.add.graphics(0, 0);
                    graphics.beginFill(game.stage.backgroundColor);
                    var button = graphics.drawRoundedRect(x, y, bw, bh, 10);

                    configDialog.add(button);
                    button.inputEnabled = true;
                    button.input.priorityID = 2;
                    button.events.onInputDown.add(function() {
                        mode = newMode;
                        configDialog.pendingDestroy = true;
                        configDialog = null;
                        game.state.start('play');
                    }, this);
                };

                createButton((game.width-bw)/2, (game.height-bh)/2 - 100, '', MODES.BEGINNER);
                createButton((game.width-bw)/2, (game.height-bh)/2,       '', MODES.INTERMEDIATE);
                createButton((game.width-bw)/2, (game.height-bh)/2 + 100, '', MODES.ADVANCED);
            }
        }, this);

        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var onClickHandler = (function() {
                    var tile = mineMap[i][j];

                    return function(sprite, pointer) {
                        if (gameOver) return;

                        curClickTime = this.input.mouse.event.timeStamp;

                        var doubleClicked = false;
                        if (curClickTime - previousClickTime < 500 && previousClickTile == sprite) {
                            doubleClicked = true;
                        }

                        previousClickTime = curClickTime;
                        previousClickTile = sprite;
                        frame = this.getFrame(tile);

                        if (firstClick) {
                            firstClick = false;
                            mineMap = this.populateMineMap(mineMap, mineCount, tile.x, tile.y);
                            tile.sprite.frame = FRAME.KNOWN;
                            this.expandTile(tile.x, tile.y, mineMap);
                        } else if (tile.known) {
                            if (doubleClicked) {
                                var neighborFlagCount = this.getNeighborFlagCount(tile.x, tile.y);
                                if (neighborFlagCount == tile.neighborMineCount) {
                                    try {
                                        this.expandTile(tile.x, tile.y, mineMap);
                                    } catch (e) {
                                        this.revealAll();
                                    }
                                }
                            }
                        } else if (this.input.mouse.event.button === Phaser.Mouse.RIGHT_BUTTON) {
                            if (tile.sprite.frame == FRAME.FLAG) {
                                tile.unflag();
                            } else {
                                tile.flag();
                            }
                        } else if (tile.sprite.frame == FRAME.FLAG) {
                            // pass
                        } else if (tile.mine) {
                            this.revealAll();
                        } else {
                            if (tile.neighborMineCount == 0) {
                                if (!tile.known) {
                                    tile.sprite.frame = frame;
                                    this.expandTile(tile.x, tile.y, mineMap);
                                }
                            } else {
                                tile.sprite.frame = frame;
                                tile.makeKnown();
                            }
                        }
                    }
                })();

                var tileSprite = tileGroup.create(j*10*tileScale, i*10*tileScale, 'tile', FRAME.UNKNOWN);
                tileSprite.frame = FRAME.UNKNOWN;
                tileSprite.scale.setTo(tileScale, tileScale);
                tileSprite.inputEnabled = true;
                tileSprite.input.priorityID = 0;
                tileSprite.events.onInputDown.add(onClickHandler, this);
                mineMap[i][j].sprite = tileSprite;
            }
        }

        var xOffset = (game.width - width*tileScale*10)/2;
        tileGroup.x = xOffset;
        tileGroup.y = 120;
    },

    update: function() {
        if (gameOver) return;

        if (textTimeElapsed) {
            if (gameStartTimestamp) {
                textTimeElapsed.text = Math.floor(((new Date()).getTime() - gameStartTimestamp) / 1000) || 0;
            } else {
                textTimeElapsed.text = 0;
            }

            textMinesLeft.text = mineCount - flaggedCount;
        }
    },

    createText: function() {
        var style = { font: "28px VT323", fill: "#FF0000", tabs: [ 150, 150, 200 ] };
        textTimeElapsed = game.add.text(300, 30, 0, style);
        textMinesLeft = game.add.text(550, 30, 0, style);
    },

    revealAll: function() {
        gameOver = true;
        face.frame = 1;

        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var tile = mineMap[i][j];
                if (!tile.known) {
                    tile.sprite.frame = this.getFrame(tile);
                    tile.makeKnown();
                }
            }
        }
    },

    getFrame: function(tile) {
        if (tile.mine) {
            return FRAME.MINE;
        } else if (tile.neighborMineCount == 0) {
            return FRAME.KNOWN;
        } else {
            return tile.neighborMineCount+3;
        }
    },

    genEmptyMineMap: function(width, height) {
        var map = [];
        for (var i = 0; i < height; i++) {
            map.push([]);
            for (var j = 0; j < width; j++) {
                map[i].push({ 
                    x: j,
                    y: i,
                    mine: true,
                    neighborMineCount: 0,
                    known: false,
                    makeKnown: function() {
                        if (this.known) return;

                        this.known = true;
                        knownCount++;

                        if (knownCount >= width*height-mineCount && !gameOver) {
                            gameOver = true;
                            face.frame = 2;
                            //this.recordWin((new Date()).getTime() - gameStartTimestamp);
                            console.log('won in ', ((new Date()).getTime() - gameStartTimestamp) / 1000, ' seconds');
                        }
                    },
                    flag: function() {
                        if (this.sprite.frame == FRAME.FLAG) return;
                        this.sprite.frame = FRAME.FLAG;
                        flaggedCount++;
                    },
                    unflag: function() {
                        if (this.sprite.frame != FRAME.FLAG) return;
                        this.sprite.frame = FRAME.UNKNOWN;
                        flaggedCount--;
                    }
                });
            }
        }

        return map;
    },

    recordWin: function(elapsedMicroSeconds) {
        if (!googleServiceReady) return;
        var request = gapi.client.games.scores.submit({ 
            leaderboardId: mode.leaderboardId,
            score: elapsedMicroSeconds
        });
        request.execute(function(response) {
            // Check to see if this is a new high score
            console.log(response);
        })
    },

    populateMineMap: function(emptyMap, mineCount, initialClickX, initialClickY) {
        var map = emptyMap;
        var width = map[0].length;
        var height = map.length;
        gameStartTimestamp = (new Date()).getTime();

        var minesPositions = [];
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                minesPositions.push([j, i]);
            }
        }

        // using strictly decreasing order so we can easily remove item from minesPositions
        for (var dy = 1; dy >= -1; dy--) {
            for (var dx = 1; dx >= -1; dx--) {
                var x = initialClickX+dx;
                var y = initialClickY+dy;

                if (x >= 0 && x < width && y >= 0 && y < height) {
                    map[y][x].mine = false;
                    minesPositions.splice(y*width+x, 1);
                }
            }
        }

        // shuffle the positions
        var minesToUncheckCount = minesPositions.length - mineCount;
        var minesToUncheck = this.getNRandomItems(minesPositions, minesToUncheckCount);

        for (var i = 0; i < minesToUncheck.length; i++) {
            var x = minesToUncheck[i][0];
            var y = minesToUncheck[i][1];
            map[y][x].mine = false;
        }

        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                if (map[i][j].mine) {
                    for (var dx = -1; dx <= 1; dx++) {
                        for (var dy = -1; dy <= 1; dy++) {
                            var x = j+dx;
                            var y = i+dy;

                            if (!(dx == 0 && dy == 0) && x >= 0 && x < width && y >= 0 && y < height) {
                                map[y][x].neighborMineCount++;
                            }
                        }
                    }
                }
            }
        }

        return map;
    },

    getNRandomItems: function(items, n) {
        var bucket = [];

        for (var i = 0; i < n; i++) {
            var rndIdx = i + Math.floor(Math.random()*(items.length-i));
            bucket.push(items[rndIdx]);
            items[rndIdx] = items[i];
        }

        return bucket;
    },

    expandTile: function(x, y, mineMap) {
        var tile = mineMap[y][x];
        tile.makeKnown();

        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                if (!(dx == 0 && dy == 0) && x+dx >= 0 && x+dx < width && y+dy >= 0 && y+dy < height) {
                    var t = mineMap[y+dy][x+dx];
                    if (!t.known && t.sprite.frame != FRAME.FLAG) {
                        if (t.mine) {
                            throw 'Boom!';
                        }

                        var frame = this.getFrame(t);
                        t.sprite.frame = frame;
                        t.makeKnown();
                        if (t.neighborMineCount == 0) {
                            this.expandTile(x+dx, y+dy, mineMap);
                        }
                    }
                }
            }
        }
    },

    getNeighborFlagCount: function(x0, y0) {
        var flagCount = 0;

        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                var x = x0+dx;
                var y = y0+dy;

                if (x >= 0 && x < width && y >= 0 && y < height && mineMap[y][x].sprite.frame == FRAME.FLAG) {
                    flagCount++;
                }
            }
        }

        return flagCount;
    }
};
