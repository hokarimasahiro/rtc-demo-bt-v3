serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    受信文字 = serial.readUntil(serial.delimiters(Delimiters.NewLine))
})
function コマンド処理 () {
    if (コマンド == "s") {
        datetimeA = 受信文字.substr(2, 100).split(",")
        rtc.setClock(
        parseFloat(datetimeA[rtc.getClockData(clockData.year)]),
        parseFloat(datetimeA[rtc.getClockData(clockData.month)]),
        parseFloat(datetimeA[rtc.getClockData(clockData.day)]),
        parseFloat(datetimeA[rtc.getClockData(clockData.weekday)]),
        parseFloat(datetimeA[rtc.getClockData(clockData.hour)]),
        parseFloat(datetimeA[rtc.getClockData(clockData.minute)]),
        parseFloat(datetimeA[rtc.getClockData(clockData.second)])
        )
        datetime = rtc.getDatetime()
        時刻表示(false)
    } else if (コマンド == "u") {
        datetime = parseFloat(受信文字.split(",")[1])
        rtc.setDatetime(datetime)
        時刻表示(false)
    } else if (コマンド == "a") {
        pins.analogPitch(parseFloat(受信文字.split(",")[1]), parseFloat(受信文字.split(",")[2]))
    } else if (コマンド == "v") {
        pins.digitalWritePin(DigitalPin.P1, 1)
        basic.pause(parseFloat(受信文字.split(",")[1]))
        pins.digitalWritePin(DigitalPin.P1, 0)
    } else if (コマンド == "n") {
        if (受信文字.split(",")[1] == "0") {
            strip.showColor(parseFloat(受信文字.split(",")[2]))
        } else {
            strip.setPixelColor(parseFloat(受信文字.split(",")[1]) - 1, parseFloat(受信文字.split(",")[2]))
        }
        strip.show()
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
    serial.writeNumbers([rtc.getData(datetime, clockData.year), rtc.getData(datetime, clockData.month), rtc.getData(datetime, clockData.day), rtc.getData(datetime, clockData.weekday), rtc.getData(datetime, clockData.hour), rtc.getData(datetime, clockData.minute), rtc.getData(datetime, clockData.second)])
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
let datetimeA: string[] = []
let 受信文字 = ""
let datetime = 0
let コマンド = ""
let strip: neopixel.Strip = null
strip = neopixel.create(DigitalPin.P0, 4)
strip.setBrightness(50)
strip.clear()
let 消灯時間 = 600
コマンド = ""
let 時計有効 = rtc.getDevice() != rtc.getClockDevice(rtcType.NON)
if (!(時計有効)) {
    basic.showIcon(IconNames.Sad)
    datetime = rtc.convDateTime(
    2009,
    2,
    13,
    23,
    31,
    30
    )
    basic.pause(500)
} else {
    datetime = rtc.getDatetime()
}
let 音声有効 = atp3012.isAvalable()
if (音声有効) {
    watchfont.plot(0, 0)
    basic.pause(200)
}
時刻表示(false)
serial.redirectToUSB()
serial.setBaudRate(BaudRate.BaudRate115200)
basic.forever(function () {
    basic.pause(100)
    if (受信文字 != "") {
        コマンド = 受信文字.split(",")[0]
        コマンド処理()
    }
    if (時計有効) {
        datetime = rtc.getDatetime()
    }
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
