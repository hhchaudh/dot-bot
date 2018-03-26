'use strict';
let setLegendAttributes = (isNavigable, isPowerup, requiredPowerups, numPowerupsRequired, name) => {
    return {
        isNavigable,
        isPowerup,
        requiredPowerups,
        numPowerupsRequired,
        name
    };
};

let moveGuide = {
    0 : -1,
    1 : -1,
    2 : 1,
    3 : 1
};

let mapLegend = {
    100 : setLegendAttributes(true, false, null, null, "start"),
    0 : setLegendAttributes(true, false, null, null, "open"),
    1 : setLegendAttributes(false, false, [2], 1, "barrier"),
    2 : setLegendAttributes(true, true, null, null, "ladder"),
    99 : setLegendAttributes(true, false, null, null, "end")
};

let getNewMap = () => {
    return {
        "map": [
          [0,2,1,1,0,0,0,0,0,0],
          [0,0,1,1,0,1,1,0,0,0],
          [100,0,1,1,0,1,1,99,0,0],
          [0,0,1,1,0,1,1,0,0,0],
          [1,0,0,1,0,1,1,0,0,0],
          [1,0,0,0,0,1,1,0,0,0],
          [1,0,0,0,0,1,1,0,0,0],
          [1,0,1,1,0,1,1,0,0,0],
          [1,0,0,0,0,1,1,0,0,0],
          [1,0,0,0,0,1,1,0,0,0]
        ],
        "startPoint" : [2, 0],
    };
};

let makeMove = (currentPosition, nextMove) => {
    if(nextMove % 2 === 0) {
        currentPosition[1] += moveGuide[nextMove];
    } else {
        currentPosition[0] += moveGuide[nextMove];
    }
};

let isValidMove = (currentPosition, gameMap, playerPowerups) => {
    if(currentPosition[0] < 0 || currentPosition[1] < 0 || currentPosition[0] >= gameMap.length || currentPosition[1] >= gameMap[0].length ) {
        return false;
    }
    console.log(` The current position : ${currentPosition}`);
    let mapPositionValue = gameMap[currentPosition[0]][currentPosition[1]];
    let positionAttributes = mapLegend[mapPositionValue];

    if(mapLegend[mapPositionValue].isNavigable) {
        if(mapLegend[mapPositionValue].isPowerup) {
            playerPowerups.push(mapPositionValue);
        }
        return true;
    } else {
        if(positionAttributes.requiredPowerups === null) {
            return false;
        }

        let numPowerupsSatisfied = 0;
        let powerupReqMet = false;
        playerPowerups.forEach((playerPowerup) => {
            if(positionAttributes.requiredPowerups.findIndex((reqPowerup) => reqPowerup === playerPowerup) !== undefined) {
                numPowerupsSatisfied++;
                if(numPowerupsSatisfied === positionAttributes.numPowerupsRequired) {
                    powerupReqMet = true;
                }
            }
        });

        return powerupReqMet;
    }
};

let isGameWon = (currentPosition, gameMap) => {
    let mapPositionValue = gameMap[currentPosition[0]][currentPosition[1]];

    return (mapLegend[mapPositionValue].name === "end");
};

module.exports = {getNewMap, makeMove, isGameWon, isValidMove};
