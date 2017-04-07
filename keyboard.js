    function readTextFile(file) {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function() {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    var rawKeyboardData = rawFile.responseText;
                    rawKeyboardData = rawKeyboardData.match(/\w+\u0009\w+\u0009[\u0009]?\w+\u0009\w+[@]?\u0009\w+[@]?\u0009[-]?\w+[@]?(\u0009[-]?\w+[@]?)?\u0009\u0009\/\//g);
                    materializeKeyboard(rawKeyboardData);
                }
            }
        }
        rawFile.send(null);
    }

    function materializeKeyboard(keyListString) {
        var keyList = keyListString.toString().split(','),
            keyObject = new Array(),
            rowData_1 = new Array(),
            rowData_2 = new Array(),
            rowData_3 = new Array(),
            rowData_4 = new Array();
        $.each(keyList, function(i, value) {
            keyObject[i] = value.toString().split(/\u0009+/g);
        });

        rowData_1[0] = keyObject[35];
        rowData_1 = rowData_1.concat(keyObject.slice(0, 12));

        rowData_2 = rowData_2.concat(keyObject.slice(12, 24));
        rowData_2.push(keyObject[36]);

        rowData_3 = rowData_3.concat(keyObject.slice(24, 35));

        rowData_4[0] = keyObject[48];
        rowData_4 = rowData_4.concat(keyObject.slice(37, 47));

        $('body').append('<div class="keyboard-wrapper"></div>');

        generateRow(rowData_1);
        generateRow(rowData_2);
        generateRow(rowData_3);
        generateRow(rowData_4);

        keyboardFillout();
        sizeKeys();
    }

    function appendKey(keyCode) {
        if (keyCode.length == 4) {
            $('.keyboard-row:last').append('<button class="keyboard-key keyboard-key-sm">&#x' + keyCode + '</button>');
        } else {
            $('.keyboard-row:last').append('<button class="keyboard-key keyboard-key-sm">' + keyCode + '</button>');
        }
    }

    function generateRow(keyListSplit) {
        $('.keyboard-wrapper').append('<div class="keyboard-row"></div>');
        $.each(keyListSplit, function(i, value) {
            appendKey(value[3]);
        });
    }

    function keyboardFillout() {
        $('.keyboard-row:eq(0)').append('<button class="keyboard-key keyboard-key-lg">Backspace</button>');
        $('.keyboard-row:eq(1)').prepend('<button class="keyboard-key keyboard-key-lg">Tab</button>');
        $('.keyboard-row:eq(2)').prepend('<button class="keyboard-key keyboard-key-lg">Caps Lock</button>');
        $('.keyboard-row:eq(2)').append('<button class="keyboard-key keyboard-key-lg">Enter</button>');
        $('.keyboard-row:eq(3)').prepend('<button class="keyboard-key keyboard-key-lg">Shift</button>');
        $('.keyboard-row:eq(3)').append('<button class="keyboard-key keyboard-key-lg">Shift</button>');
    }

    function sizeKeys() {
        var rowWidth = $('.keyboard-row').width(),
            keyPadding = 2 * ($('.keyboard-key').css('padding-right')).match(/[0-9]/),
            smallKeys, largeKeys, smallKeyConstant = rowWidth / 40,
            largeKeyWidth;
        $('.keyboard-row').each(function() {
            smallKeys = $(this).children('.keyboard-key-sm').length;
            largeKeys = $(this).children('.keyboard-key-lg').length;
            largeKeyWidth = (rowWidth - ((smallKeys + largeKeys) * keyPadding) - (smallKeys * smallKeyConstant)) / largeKeys;
            console.log((rowWidth - ((smallKeys + largeKeys) * keyPadding) - (smallKeys * smallKeyConstant)));
            console.log(smallKeys + largeKeys);
            $('.keyboard-key-sm').width(smallKeyConstant);
            $('.keyboard-key-lg').width(largeKeyWidth);
        });
    }

    var file;

    function languageSwap() {
        $('.keyboard-row').remove();
        if (file == 'albanian.klc') {
            file = 'belarusian.klc';
        } else {
            file = 'albanian.klc';
        }
        readTextFile(file);
    }

    $(document).ready(function() {
        file = 'albanian.klc';
        readTextFile(file);

        $(document).keydown()
    })
