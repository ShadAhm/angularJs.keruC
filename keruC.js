"use strict";

var f = function ($compile) {
    return {
        restrict: 'E',
        template: '<canvas width="600" height="600" id="canvasId"></canvas>',
        scope: {
            rows: '=data'
        },
        link: function (scope, element, attrs) {
            var canvas = element.find('canvas')[0];
            var nodeLocations = [];
            var rows = null;

            scope.settings = {
                canvasWidth: attrs.canvasWidth || 600,
                canvasHeight: attrs.canvasHeight || 600,
                freeSeatColour: attrs.freeSeatColour || '#76D75D',
                freeSeatTextColour: attrs.freeSeatTextColour || '#C1F2B4',
                takenSeatColour: attrs.takenSeatColour || '#F56979',
                takenSeatTextColour: attrs.takenSeatTextColour || '#BB1F31',
                selectedSeatColor: attrs.selectedSeatColor || '#7854AF',
                selectedSeatTextColor: attrs.selectedSeatTextColor || '#472085'
            };

            var structure = 
                {
                    eachCabangX: 0,
                    eachCabangY: 0,
                    eachSquare : { width : 0, height : 0 }
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

                var numberOfCabangX = longestRow + 1;
                var numberOfCabangY = rows.length + 1;

                var totalCabangSpaceX = canvasWidth * 0.1;
                var totalCabangSpaceY = canvasHeight * 0.1;

                structure.eachCabangX = totalCabangSpaceX / numberOfCabangX;
                structure.eachCabangY = totalCabangSpaceY / numberOfCabangY;
                structure.eachSquare.width = (canvasWidth - totalCabangSpaceX) / longestRow;
                structure.eachSquare.height = (canvasHeight - totalCabangSpaceY) / rows.length;

                draw();
            };

            scope.$watch('rows', onRowDataChanged);

            var draw = function () {
                if (rows == null)
                    return;

                var ctx = canvas.getContext('2d');

                var lastUp = 0;
                for (var i = 0; i < rows.length; ++i) {
                    var lastRight = 0;

                    for (var j = 0; j < rows[i].nodes.length; ++j) {
                        if (rows[i].nodes[j].type == 0) {
                            lastRight = lastRight + structure.eachCabangX + structure.eachSquare.width;
                        }
                        else {
                            var seatColour = '#000000';
                            var textColour = '#000000';

                            switch (rows[i].nodes[j].selected) {
                                case 0:
                                    seatColour = scope.settings.freeSeatColour;
                                    textColour = scope.settings.freeSeatTextColour;
                                    break;
                                case 1:
                                    seatColour = scope.settings.takenSeatColour;
                                    textColour = scope.settings.takenSeatTextColour;
                                    break;
                                case 2:
                                    seatColour = scope.settings.selectedSeatColour;
                                    textColour = scope.settings.selectedSeatTextColor;
                                    break;
                            }

                            ctx.fillStyle = seatColour;
                            ctx.fillRect(lastRight + structure.eachCabangX, lastUp + structure.eachCabangY, structure.eachSquare.width, structure.eachSquare.height);

                            nodeLocations.push({
                                node: rows[i].nodes[j],
                                x: lastRight + structure.eachCabangX,
                                y: lastUp + structure.eachCabangY,
                                width: structure.eachSquare.width,
                                height: structure.eachSquare.height
                            });

                            ctx.fillStyle = textColour;
                            ctx.textBaseline = 'middle';
                            ctx.textAlign = 'center';
                            ctx.font = "20pt sans-serif";
                            ctx.fillText(rows[i].nodes[j].displayName, lastRight + structure.eachCabangX + (structure.eachSquare.width / 2), lastUp + structure.eachCabangY + (structure.eachSquare.height / 2));

                            lastRight = lastRight + structure.eachCabangX + structure.eachSquare.width;
                        }
                    }

                    lastUp = lastUp + structure.eachCabangY + structure.eachSquare.height;
                }

                addClickEventToCanvas(); 
            };

            var reDraw = function (node) {
                var ctx = canvas.getContext('2d');

                ctx.fillStyle = node.node.selected == 0 ? scope.settings.freeSeatColour : scope.settings.selectedSeatColor;
                ctx.fillRect(node.x, node.y, node.width, node.height);

                ctx.fillStyle = node.node.selected == 0 ? scope.settings.freeSeatTextColour : scope.settings.selectedSeatTextColor;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.font = "20pt sans-serif";
                ctx.fillText(node.node.displayName, node.x + (structure.eachSquare.width / 2), node.y + (structure.eachSquare.height / 2));
            };

            var onCanvasClick = function (e) {
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
                        }
                    }
                }

                if (clickedNode == null || clickedNode.node.selected == 1)
                    return; else 
                    reDraw(clickedNode);
            };

            var addClickEventToCanvas = function () {
                canvas.addEventListener('click', onCanvasClick, false);
            };
        }
    }
};

angular.module('keruc', []).directive('keruc', ['$compile', f]);



