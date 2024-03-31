'use strict';

const race_trackData = {};
const types = race_track.trackTypeEnums;
race_trackData.race_track1 = [
    [
        {type: types.blank, rot: 0, dir:0, revdir:0},
        {type: types.blank, rot: 0, dir:0, revdir:0},
        {type: types.turn, rot: 3, dir:2, revdir:1},
        {type: types.straight, rot: 0, dir:3, revdir:1},
        {type: types.turn, rot: 0, dir:3, revdir:2},
    ],
    [
        {type: types.turn, rot: 3, dir:2, revdir:1},
        {type: types.straight, rot: 0, dir:3, revdir:1},
        {type: types.turn, rot: 1, dir:3, revdir:0},
        {type: types.turn, rot: 3, dir:1, revdir:2},
        {type: types.turn, rot: 1, dir:0, revdir:3},
    ],
    [
        {type: types.straight, rot: 1, dir:2, revdir:0},
        {type: types.blank, rot: 0, dir:0, revdir:0},
        {type: types.blank, rot: 0, dir:0, revdir:0},
        {type: types.straight, rot: 1, dir:0, revdir:2},
        {type: types.blank, rot: 0, dir:0, revdir:0},
    ],
    [
        {type: types.turn, rot: 2, dir:1, revdir:0},
        {type: types.straight, rot: 0, dir:1, revdir:3},
        {type: types.startFinish, rot: 0, dir:1, revdir:3},
        {type: types.turn, rot: 1, dir:0, revdir:3},
        {type: types.blank, rot: 0, dir:0, revdir:0},
    ],
];
