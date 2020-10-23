def 時間更新():
    pass

def on_uart_data_received():
    global 受信文字
    受信文字 = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NEW_LINE))
bluetooth.on_uart_data_received(serial.delimiters(Delimiters.NEW_LINE),
    on_uart_data_received)

def コマンド処理():
    global datetimeA, datetime, 受信文字
    if コマンド == "s":
        datetimeA = split.split_num(受信文字.substr(2, 100))
        datetime = rtc.conv_date_time(datetimeA[rtc.get_clock_data(clockData.YEAR)],
            datetimeA[rtc.get_clock_data(clockData.MONTH)],
            datetimeA[rtc.get_clock_data(clockData.DAY)],
            datetimeA[rtc.get_clock_data(clockData.HOUR)],
            datetimeA[rtc.get_clock_data(clockData.MINUTE)],
            datetimeA[rtc.get_clock_data(clockData.SECOND)])
        rtc.set_datetime(datetime)
        時刻表示(False)
    elif コマンド == "a":
        pins.analog_pitch(parse_float(受信文字.split(",")[1]),
            parse_float(受信文字.split(",")[2]))
    elif コマンド == "v":
        pins.digital_write_pin(DigitalPin.P1, 1)
        basic.pause(parse_float(受信文字.split(",")[1]))
        pins.digital_write_pin(DigitalPin.P1, 0)
    受信文字 = ""
def 表示方向():
    if input.rotation(Rotation.PITCH) <= -40:
        watchfont.set_rotatation(rotate.UNDER)
    else:
        watchfont.set_rotatation(rotate.TOP)
    if input.rotation(Rotation.ROLL) < -75:
        watchfont.set_rotatation(rotate.RIGHT)
    elif input.rotation(Rotation.ROLL) > 75:
        watchfont.set_rotatation(rotate.LEFT)
def 秒表示():
    表示方向()
    watchfont.show_number2(rtc.get_data(datetime, clockData.SECOND))
def 時刻表示(読み上げ: bool):
    if 読み上げ:
        atp3012.write("tada'ima <NUMK VAL=" + str(rtc.get_data(datetime, clockData.HOUR)) + " COUNTER=ji>" + " <NUMK VAL=" + str(rtc.get_data(datetime, clockData.MINUTE)) + " COUNTER=funn>desu.")
    表示方向()
    watchfont.show_number2(rtc.get_data(datetime, clockData.HOUR))
    basic.pause(1000)
    basic.clear_screen()
    basic.pause(200)
    watchfont.show_number2(rtc.get_data(datetime, clockData.MINUTE))
    basic.pause(1000)
    basic.clear_screen()
    basic.pause(500)
datetime = 0
受信文字 = ""
datetimeA: List[number] = []
コマンド = ""
pins.digital_write_pin(DigitalPin.P0, 0)
pins.digital_write_pin(DigitalPin.P1, 0)
pins.digital_write_pin(DigitalPin.P2, 0)
消灯時間 = 600
コマンド = ""
時計有効 = rtc.get_device() != rtc.get_clock_device(rtcType.NON)
if not (時計有効):
    basic.show_icon(IconNames.SAD)
    basic.pause(500)
音声有効 = rtc.test_read_i2c(46) == 0
if 音声有効:
    watchfont.plot(0, 0)
    basic.pause(200)
bluetooth.start_uart_service()
datetimeA = rtc.get_clock()
時刻表示(False)

def on_forever():
    global コマンド, datetime
    basic.pause(100)
    if 受信文字 != "":
        コマンド = 受信文字.split(",")[0]
        コマンド処理()
    datetime = rtc.get_datetime()
    if rtc.get_data(datetime, clockData.MINUTE) == 0 and rtc.get_data(datetime, clockData.SECOND) == 0:
        pins.digital_write_pin(DigitalPin.P1, 1)
        basic.pause(200)
        pins.digital_write_pin(DigitalPin.P1, 0)
        basic.pause(800)
    if input.button_is_pressed(Button.A) and not (input.button_is_pressed(Button.B)):
        時刻表示(音声有効)
    elif input.button_is_pressed(Button.B) and not (input.button_is_pressed(Button.A)):
        秒表示()
    elif input.is_gesture(Gesture.SHAKE):
        時刻表示(False)
    else:
        basic.clear_screen()
basic.forever(on_forever)
