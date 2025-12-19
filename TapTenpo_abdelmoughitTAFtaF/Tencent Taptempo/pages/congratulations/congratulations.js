Page({
    onGoHome() {
        wx.navigateBack({
            delta: 10 // Go back to the very beginning or use reLaunch
        });
        // Or specifically relaunch to index
        wx.reLaunch({
            url: '/pages/index/index'
        });
    }
});
