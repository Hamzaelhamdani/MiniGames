Page({
  data: {
    exit: false
  },

  onLoad() {
    // Timer to trigger exit animation
    setTimeout(() => {
      this.setData({
        exit: true
      });

      // Wait for exit animation to finish before redirecting
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/index/index'
        });
      }, 500); // 500ms matches the CSS transition time
    }, 2500); // 2.5 seconds display time
  }
});
