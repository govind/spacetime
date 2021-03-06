'use strict';
const zones = require('../../data');
const isDst = require('./isDst');

const parseDst = dst => {
  if (!dst) {
    return {};
  }
  let arr = dst.split(' -> ').map(s => {
    let tmp = s.split('/').map(n => parseInt(n, 10));
    return {
      month: tmp[0],
      date: tmp[1],
      hour: tmp[2],
    };
  });
  return {
    start: arr[0],
    end: arr[1],
  };
};

//get metadata about this timezone
const timezone = s => {
  let tz = s.tz;
  if (!zones[tz]) {
    console.warn("Warn: could not find given or local timezone - '" + tz + "'");
    return {
      current: {
        epochShift: 0,
      },
    };
  }
  let meta = {
    name: tz,
  };
  meta.dst = parseDst(zones[tz].dst);
  meta.dst.change = 0;
  if (meta.dst.start && meta.dst.end) {
    meta.dst.change = -60;
    //the only exception to this rule is 'lord howe'
    if (meta.name === 'Australia/Lord_Howe') {
      meta.dst.change = -30;
    }
  }
  //include hemisphere (for seasons)
  meta.hemisphere = null;
  if (zones[tz].h === 'n') {
    meta.hemisphere = 'North';
  } else if (zones[tz].h === 's') {
    meta.hemisphere = 'South';
  }

  //both offsets (in mins)
  meta.offsets = {
    base: zones[tz].o + meta.dst.change,
    dst: zones[tz].o,
  };

  if (isDst(s, meta.dst)) {
    meta.current = {
      isDst: true,
      offset: meta.offsets.dst,
    };
  } else {
    meta.current = {
      isDst: false,
      offset: meta.offsets.base,
    };
  }
  meta.current.epochShift = meta.current.offset * 60 * 1000;
  return meta;
};
module.exports = timezone;
