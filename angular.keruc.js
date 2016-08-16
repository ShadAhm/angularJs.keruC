"use strict";

var f = function ($compile) {
    return {
        restrict: 'E',
        template: '<canvas width="{{settings.canvasWidth}}" height="{{settings.canvasHeight}}" id="canvasId"></canvas>',
        scope: {
            rows: '=data',
            selectedNodes: '=',
            onSelected: '&',
            onDeselected: '&',
            onDisallowedSelected: '&'
        },
        link: function (scope, element, attrs) {
            var nodeLocations = [];
            var rows = null;

            scope.settings = {
                canvasWidth: attrs.canvasWidth || 500,
                canvasHeight: attrs.canvasHeight || 500,
                vacantColourBg: attrs.vacantColourBg || '#76D75D',
                vacantColourFg: attrs.vacantColourFg || '#C1F2B4',
                occupiedColourBg: attrs.occupiedColourBg || '#F56979',
                occupiedColourFg: attrs.occupiedColourFg || '#BB1F31',
                selectedColourBg: attrs.selectedColourBg || '#7854AF',
                selectedColourFg: attrs.selectedColourFg || '#472085',
                showRowLabel: attrs.showRowLabel || false,
                showSeatLabel: attrs.showSeatLabel || true
            };

            var structure =
                {
                    squareGapX: 0, // gaps between squares, 3 squares will have 2 gaps between them
                    squareGapY: 0,
                    eachSquare: { width: 0, height: 0 }
                }

            var onRowDataChanged = function (newData) {
                if (newData == null)
                    return;

                rows = newData.rows;
                var canvasWidth = scope.settings.canvasWidth;
                var canvasHeight = scope.settings.canvasHeight;

                var longestRow = 0;

                for (var i = 0; i < rows.length; ++i) {
                    if (rows[i].nodes.length >= longestRow)
                        longestRow = rows[i].nodes.length;
                }

                if (scope.settings.showRowLabel)
                    longestRow = longestRow + 2;

                var numberOfSquareGapsX = longestRow + 1;
                var numberOfSquareGapsY = rows.length + 1;

                var totalSquareGapSpaceX = canvasWidth * 0.1;
                var totalSquareGapSpaceY = canvasHeight * 0.1;

                structure.squareGapX = totalSquareGapSpaceX / numberOfSquareGapsX;
                structure.squareGapY = totalSquareGapSpaceY / numberOfSquareGapsY;
                structure.eachSquare.width = (canvasWidth - totalSquareGapSpaceX) / longestRow;
                structure.eachSquare.height = (canvasHeight - totalSquareGapSpaceY) / rows.length;

                draw();
                addClickEventToCanvas();
            };

            scope.$watch('rows', onRowDataChanged);

            var drawSquare = function (selected, xPos, yPos, width, height, displayName) {
                var canvas = element.find('canvas')[0];
                var ctx = canvas.getContext('2d');
                var fontSize = structure.eachSquare.width * 0.4;
                var seatColour = '#000000';
                var textColour = '#000000';

                var boxCentrePointX = xPos + (structure.eachSquare.width / 2);
                var boxCentrePointY = yPos + (structure.eachSquare.height / 2);

                switch (selected) {
                    case 0:
                        seatColour = scope.settings.vacantColourBg;
                        textColour = scope.settings.vacantColourFg;
                        break;
                    case 1:
                        seatColour = scope.settings.occupiedColourBg;
                        textColour = scope.settings.occupiedColourFg;
                        break;
                    case 2:
                        seatColour = scope.settings.selectedColourBg;
                        textColour = scope.settings.selectedColourFg;

                        ctx.fillStyle = seatColour;
                        ctx.fillRect(xPos, yPos, width, height);

                        ctx.fillStyle = '#472085';
                        ctx.beginPath();
                        ctx.arc(boxCentrePointX, boxCentrePointY, structure.eachSquare.width * 0.2, 0, 2 * Math.PI);
                        ctx.closePath();
                        ctx.fill();

                        ctx.beginPath();
                        ctx.fillStyle = '#472085';
                        ctx.beginPath();
                        ctx.arc(boxCentrePointX, yPos + structure.eachSquare.height, structure.eachSquare.width * 0.35, 0, Math.PI, true);
                        ctx.closePath();
                        ctx.fill();
                        return;
                }

                ctx.fillStyle = seatColour;
                ctx.fillRect(xPos, yPos, width, height);

                if (scope.settings.showSeatLabel == true) {
                    ctx.fillStyle = textColour;
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'center';
                    ctx.font = fontSize + 'px sans-serif';
                    ctx.fillText(displayName, boxCentrePointX, boxCentrePointY);
                }
            };

            var drawRowLabel = function (row, xPos, yPos) {
                var canvas = element.find('canvas')[0];
                var ctx = canvas.getContext('2d');
                var fontSize = structure.eachSquare.width * 0.35;
                var textColour = '#999999';

                var boxCentrePointX = xPos + (structure.eachSquare.width / 2);
                var boxCentrePointY = yPos + (structure.eachSquare.height / 2);

                ctx.fillStyle = textColour;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.font = fontSize + 'px sans-serif';
                ctx.fillText(row.rowName, boxCentrePointX, boxCentrePointY);

                return xPos + structure.squareGapX + structure.eachSquare.width;
            };

            var draw = function () {
                if (rows == null)
                    return;

                var lastUp = 0;
                for (var i = 0; i < rows.length; ++i) {
                    var lastRight = 0;

                    if (scope.settings.showRowLabel == true) {
                        lastRight = drawRowLabel(rows[i], lastRight + structure.squareGapX, lastUp + structure.squareGapY);
                    }

                    for (var j = 0; j < rows[i].nodes.length; ++j) {
                        if (rows[i].nodes[j].type == 0) {
                            lastRight = lastRight + structure.squareGapX + structure.eachSquare.width;
                        }
                        else {
                            drawSquare(
                                rows[i].nodes[j].selected,
                                lastRight + structure.squareGapX,
                                lastUp + structure.squareGapY,
                                structure.eachSquare.width,
                                structure.eachSquare.height,
                                rows[i].nodes[j].displayName
                            );

                            nodeLocations.push({
                                node: rows[i].nodes[j],
                                x: lastRight + structure.squareGapX,
                                y: lastUp + structure.squareGapY,
                                width: structure.eachSquare.width,
                                height: structure.eachSquare.height
                            });

                            lastRight = lastRight + structure.squareGapX + structure.eachSquare.width;
                        }
                    }

                    if (scope.settings.showRowLabel == true) {
                        lastRight = drawRowLabel(rows[i], lastRight + structure.squareGapX, lastUp + structure.squareGapY);
                    }

                    lastUp = lastUp + structure.squareGapY + structure.eachSquare.height;
                }
            };

            var onCanvasClick = function (e) {
                var canvas = element.find('canvas')[0];
                var x = e.pageX - canvas.offsetLeft;
                var y = e.pageY - canvas.offsetTop;

                var clickedNode = null;

                for (var i = 0; i < nodeLocations.length; i++) {
                    var minX = nodeLocations[i].x;
                    var maxX = nodeLocations[i].x + nodeLocations[i].width;
                    var minY = nodeLocations[i].y;
                    var maxY = nodeLocations[i].y + nodeLocations[i].height;

                    var isInBox = (x > minX && x < maxX) && (y > minY && y < maxY);

                    if (isInBox) {
                        clickedNode = nodeLocations[i];
                        if (clickedNode.node.selected != 1) {
                            clickedNode.node.selected = clickedNode.node.selected == 0 ? 2 : 0;
                            nodeLocations[i] = clickedNode;

                            switch (clickedNode.node.selected) {
                                case 0:
                                    var indexof = scope.selectedNodes.indexOf(clickedNode.node);
                                    scope.selectedNodes.splice(indexof, 1);
                                    break;
                                case 2: scope.selectedNodes.push(clickedNode.node);
                                    break;
                            }
                            scope.$apply();
                        }
                    }
                }

                if (clickedNode == null || clickedNode.node.selected == 1) {
                    scope.onDisallowedSelected({ "$node": clickedNode.node });
                    return;
                }
                else {
                    switch (clickedNode.node.selected) {
                        case 0: scope.onDeselected({ "$node": clickedNode.node });
                            break;
                        case 2: scope.onSelected({ "$node": clickedNode.node });
                            break;
                    }

                    drawSquare(
                        clickedNode.node.selected,
                        clickedNode.x,
                        clickedNode.y,
                        clickedNode.width,
                        clickedNode.height,
                        clickedNode.node.displayName
                    );
                }
            };

            var addClickEventToCanvas = function () {
                var canvas = element.find('canvas')[0];
                canvas.addEventListener('click', onCanvasClick, false);
            };
        }
    }
};

angular.module('keruC', []).directive('kerucSeatpicker', ['$compile', f]);
