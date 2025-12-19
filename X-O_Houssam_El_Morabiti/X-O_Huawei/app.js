// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = ma.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    ma.setStorageSync('logs', logs);

    // 登录
    ma.getAuthCode({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    });
  },
  globalData: {
    userInfo: null
  }
});