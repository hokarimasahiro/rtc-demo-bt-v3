function 時間更新 () {
	
}
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    受信文字 = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
})
function コマンド処理 () {
    if (コマンド == "s") {
        datetimeA = split.splitNum(受信文字.substr(2, 100))
        datetime = rtc.convDateTime(
        datetimeA[rtc.getClockData(clockData.year)],
        datetimeA[rtc.getClockData(clockData.month)],
        datetimeA[rtc.getClockData(clockData.day)],
        datetimeA[rtc.getClockData(clockData.hour)],
        datetimeA[rtc.getClockData(clockData.minute)],
        datetimeA[rtc.getClockData(clockData.second)]
        )
        rtc.setDatetime(datetime)
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
    watchfont.showNumber2(rtc.getData(datetime, clockData.second))
}
function 時刻表示 (読み上げ: boolean) {
    if (読み上げ) {
        atp3012.write("tada'ima <NUMK VAL=" + rtc.getData(datetime, clockData.hour) + " COUNTER=ji>" + " <NUMK VAL=" + rtc.getData(datetime, clockData.minute) + " COUNTER=funn>desu.")
    }
    表示方向()
    watchfont.showNumber2(rtc.getData(datetime, clockData.hour))
    basic.pause(1000)
    basic.clearScreen()
    basic.pause(200)
    watchfont.showNumber2(rtc.getData(datetime, clockData.minute))
    basic.pause(1000)
    basic.clearScreen()
    basic.pause(500)
}
let datetime = 0
let 受信文字 = ""
let datetimeA: number[] = []
let コマンド = ""
pins.digitalWritePin(DigitalPin.P0, 0)
pins.digitalWritePin(DigitalPin.P1, 0)
pins.digitalWritePin(DigitalPin.P2, 0)
let 消灯時間 = 600
コマンド = ""
let 時計有効 = rtc.getDevice() != rtc.getClockDevice(rtcType.NON)
if (!(時計有効)) {
    basic.showIcon(IconNames.Sad)
    basic.pause(500)
}
let 音声有効 = rtc.testReadI2c(46) == 0
if (音声有効) {
    watchfont.plot(0, 0)
    basic.pause(200)
}
bluetooth.startUartService()
datetimeA = rtc.getClock()
時刻表示(false)
basic.forever(function () {
    basic.pause(100)
    if (受信文字 != "") {
        コマンド = 受信文字.split(",")[0]
        コマンド処理()
    }
    datetime = rtc.getDatetime()
    if (rtc.getData(datetime, clockData.minute) == 0 && rtc.getData(datetime, clockData.second) == 0) {
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
