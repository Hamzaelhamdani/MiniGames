// logs.js
const util = require('../../utils/util.js');
Page({
  data: {
    logs: []
  },
  onLoad() {
    this.setData({
      logs: (ma.getStorageSync('logs') || []).map(log => {
        return {
          date: util.formatTime(new Date(log)),
          timeStamp: log
        };
      })
    });
  }
});