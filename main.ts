function 時間更新 () {
	
}
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    受信文字 = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
})
function コマンド処理 () {
    if (コマンド == "s") {
        datetime = split.splitNum(受信文字.substr(2, 100))
        rtc.setClockArray(datetime)
        開始時刻 = (datetime[rtc.getClockData(clockData.hour)] * 60 + datetime[rtc.getClockData(clockData.minute)]) * 60 + datetime[rtc.getClockData(clockData.second)]
        システム開始 = input.runningTime()
        時刻表示(false)
    } else if (コマンド == "a") {
        pins.analogPitch(parseFloat(受信文字.split(",")[1]), parseFloat(受信文字.split(",")[2]))
    } else if (コマンド == "v") {
        pins.digitalWritePin(DigitalPin.P1, 1)
        basic.pause(parseFloat(受信文字.split(",")[1]))
        pins.digitalWritePin(DigitalPin.P1, 0)
    }
    受信文字 = ""
}
function 表示方向 () {
    if (input.rotation(Rotation.Pitch) <= -40) {
        watchfont.setRotatation(rotate.under)
    } else {
        watchfont.setRotatation(rotate.top)
    }
    if (input.rotation(Rotation.Roll) < -75) {
        watchfont.setRotatation(rotate.right)
    } else if (input.rotation(Rotation.Roll) > 75) {
        watchfont.setRotatation(rotate.left)
    }
}
function 秒表示 () {
    表示方向()
    watchfont.showNumber2(datetime[rtc.getClockData(clockData.second)])
}
function 時刻表示 (読み上げ: boolean) {
    if (読み上げ) {
        atp3012.write("tada'ima <NUMK VAL=" + datetime[rtc.getClockData(clockData.hour)] + " COUNTER=ji>" + " <NUMK VAL=" + datetime[rtc.getClockData(clockData.minute)] + " COUNTER=funn>desu.")
    }
    表示方向()
    watchfont.showNumber2(datetime[rtc.getClockData(clockData.hour)])
    basic.pause(1000)
    basic.clearScreen()
    basic.pause(200)
    watchfont.showNumber2(datetime[rtc.getClockData(clockData.minute)])
    basic.pause(1000)
    basic.clearScreen()
    basic.pause(500)
}
let RTC時間 = 0
let 開始時刻 = 0
let 受信文字 = ""
let datetime: number[] = []
let システム開始 = 0
let コマンド = ""
pins.digitalWritePin(DigitalPin.P0, 0)
pins.digitalWritePin(DigitalPin.P1, 0)
pins.digitalWritePin(DigitalPin.P2, 0)
let 消灯時間 = 600
コマンド = ""
let 時計有効 = rtc.getDevice() != rtc.getClockDevice(rtcType.NON)
if (!(時計有効)) {
    システム開始 = input.runningTime()
    basic.showIcon(IconNames.Sad)
    basic.pause(500)
}
let 音声有効 = rtc.testReadI2c(46) == 0
if (音声有効) {
    watchfont.plot(0, 0)
    basic.pause(200)
}
bluetooth.startUartService()
datetime = rtc.getClock()
時刻表示(false)
basic.forever(function () {
    basic.pause(100)
    if (受信文字 != "") {
        コマンド = 受信文字.split(",")[0]
        コマンド処理()
    }
    if (時計有効) {
        datetime = rtc.getClock()
    } else {
        RTC時間 = 開始時刻 + (input.runningTime() - システム開始) / 1000
        datetime[rtc.getClockData(clockData.second)] = RTC時間 % 60
        datetime[rtc.getClockData(clockData.minute)] = Math.trunc(RTC時間 / 60) % 60
        datetime[rtc.getClockData(clockData.hour)] = Math.trunc(RTC時間 / 3600) % 24
    }
    if (datetime[rtc.getClockData(clockData.minute)] == 0 && datetime[rtc.getClockData(clockData.second)] == 0) {
        pins.digitalWritePin(DigitalPin.P1, 1)
        basic.pause(200)
        pins.digitalWritePin(DigitalPin.P1, 0)
        basic.pause(800)
    }
    if (input.buttonIsPressed(Button.A) && !(input.buttonIsPressed(Button.B))) {
        時刻表示(音声有効)
    } else if (input.buttonIsPressed(Button.B) && !(input.buttonIsPressed(Button.A))) {
        秒表示()
    } else if (input.isGesture(Gesture.Shake)) {
        時刻表示(false)
    } else {
        basic.clearScreen()
    }
})
