'use strict';

const race_trackData = {};
const types = race_track.trackTypeEnums;
race_trackData.race_track1 = [
    [
        {type: types.blank, rot: 0},
        {type: types.blank, rot: 0},
        {type: types.turn, rot: 3},
        {type: types.straight, rot: 0},
        {type: types.turn, rot: 0},
    ],
    [
        {type: types.turn, rot: 3},
        {type: types.straight, rot: 0},
        {type: types.turn, rot: 1},
        {type: types.turn, rot: 3},
        {type: types.turn, rot: 1},
    ],
    [
        {type: types.straight, rot: 1},
        {type: types.blank, rot: 0},
        {type: types.blank, rot: 0},
        {type: types.straight, rot: 1},
        {type: types.blank, rot: 0},
    ],
    [
        {type: types.turn, rot: 2},
        {type: types.straight, rot: 0},
        {type: types.startFinish, rot: 0},
        {type: types.turn, rot: 1},
        {type: types.blank, rot: 0},
    ],
];
