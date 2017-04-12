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

        setKeys('default');
        keyboardFillout();
        sizeKeys();
    }

    function appendKey(keyJSON) {
        $('.keyboard-row:last').append('<button class="keyboard-key keyboard-key-sm"></button>');
        $('.keyboard-key:last').data('keyDataJSON', keyJSON);
    }

    function generateRow(keyListSplit) {
        var keyJSON;
        $('.keyboard-wrapper').append('<div class="keyboard-row"></div>');
        $.each(keyListSplit, function(i, value) {
            keyJSON = { default: value[3], caps: value[4].match(/[A-Z]/) ? value[4] : value[3], shift: value[4], altgrp: value[6] == '//' ? '-1' : value[6] };
            appendKey(keyJSON);
        });
    }

    function keyboardFillout() {
        $('.keyboard-row:eq(0)').append('<button class="keyboard-key keyboard-key-lg">Backspace</button>');
        $('.keyboard-row:eq(1)').prepend('<button class="keyboard-key keyboard-key-lg">Tab</button>');
        $('.keyboard-row:eq(2)').prepend('<button class="keyboard-key keyboard-key-lg caps-lock-key">Caps Lock</button>');
        $('.keyboard-row:eq(2)').append('<button class="keyboard-key keyboard-key-lg">Enter</button>');
        $('.keyboard-row:eq(3)').prepend('<button class="keyboard-key keyboard-key-lg">Shift</button>');
        $('.keyboard-row:eq(3)').append('<button class="keyboard-key keyboard-key-lg">Shift</button>');
        $('.keyboard-wrapper').append('<div class="keyboard-row"></div>');
        $('.keyboard-row:eq(4)').append('<button class="keyboard-key keyboard-key-lg">Ctrl</button>');
        $('.keyboard-row:eq(4)').append('<button class="keyboard-key keyboard-key-lg">Settings</button>');
        $('.keyboard-row:eq(4)').append('<button class="keyboard-key keyboard-key-lg">Alt</button>');
        $('.keyboard-row:eq(4)').append('<button class="keyboard-key keyboard-key-xl">&nbsp;</button>');
        $('.keyboard-row:eq(4)').append('<button class="keyboard-key keyboard-key-lg">Alt Grp</button>');
        $('.keyboard-row:eq(4)').append('<button class="keyboard-key keyboard-key-lg">Ctrl</button>');
        $('.keyboard-row:eq(4)').append('<button class="keyboard-key keyboard-key-lg">&nbsp;</button>');
    }

    function sizeKeys() {
        var rowWidth = $('.keyboard-row').width(),
            maxKeyCount = 15,
            keyPadding = 2 * ($('.keyboard-key').css('margin-right')).match(/[0-9]/),
            smallKeys,
            largeKeys,
            xlargeKeys,
            smallKeyWidth = (rowWidth - (maxKeyCount * keyPadding)) / maxKeyCount,
            largeKeyWidth,
            xlargeKeyWidth = rowWidth / 3;

        $('.keyboard-row').each(function() {
            smallKeys = $(this).children('.keyboard-key-sm').length;
            largeKeys = $(this).children('.keyboard-key-lg').length;
            xlargeKeys = $(this).children('.keyboard-key-xl').length;
            largeKeyWidth = (rowWidth - ((smallKeys + largeKeys + xlargeKeys) * keyPadding) - (smallKeys * smallKeyWidth) - (xlargeKeys * xlargeKeyWidth)) / largeKeys;
            $(this).children('.keyboard-key-sm').width(smallKeyWidth);
            $(this).children('.keyboard-key-lg').width(largeKeyWidth);
            $(this).children('.keyboard-key-xl').width(xlargeKeyWidth);
        });
    }

    function setKeys(keyType) {
        console.log('Key: ' + keyType + ' holdCaps: ' + holdCaps);
        var keyJSON;
        if (holdCaps) {
            keyType = 'caps';
            $('.caps-lock-key').addClass('caps-lock-key-active');
        } else if (!holdCaps) {
            keyType = keyType == 'caps' ? 'default' : keyType;
            $('.caps-lock-key').removeClass('caps-lock-key-active');
        }
        $('.keyboard-key').each(function() {
            try {
                keyJSON = $(this).data('keyDataJSON');
                if (keyJSON[keyType].length == 4) {
                    $(this).html('&#x' + keyJSON[keyType]);
                } else if (keyJSON[keyType] == '-1' || keyJSON[keyType].length == 0 || keyJSON[keyType].match('@')) {
                    $(this).html('&nbsp;');
                } else {
                    $(this).html(keyJSON[keyType]);
                }
            } catch (err) {
                //
            }
        });
    }

    var holdCaps = false;

    function handleKeypress(keyPressed) {
        if (keyPressed.length > 1) {
            switch (keyPressed) {
                case 'Shift':
                    holdCaps = false;
                    setKeys('shift');
                    break;
                case 'Caps Lock':
                    holdCaps = holdCaps ? false : true;
                    setKeys('caps');
                    break;
                case 'Alt Grp':
                    holdCaps = false;
                    setKeys('altgrp');
                    break;
            }
        } else {
            setKeys('default');
        }
    }

    var file;

    function languageSwap() {
        $('.keyboard-wrapper').remove();
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

        $(document).on('click touch', '.keyboard-key', function() {
            handleKeypress($(this).html());
        });

        //$(document).keydown();
    })
