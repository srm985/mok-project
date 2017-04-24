//***********************************************************************************
//*                                                                                 *
//*            MOK Project - Multilingual Onscreen Keyboard                         *
//*                                                                                 *
//*            Author: Sean McQuay (www.seanmcquay.com)                             *
//*                                                                                 *
//*            Started: March 2017                                                  *
//*            Version: 0                                                           *
//*                                                                                 *
//*            License: MIT (https://opensource.org/licenses/MIT)                   *
//*                                                                                 *
//***********************************************************************************

$.fn.keyboard = function(options) {

    var keyStatusObject = { shift: false, caps: false, altgrp: false },
        pageElement = $(this),
        focusedInputField,
        languageList,
        resizeTimerActive = false,
        languageArrayPosition;

    //*****Find all of our default options defined here.*****
    options = {
        language: typeof(options.language) === 'undefined' ? 'english' : options.language,
        keyColor: typeof(options.keyColor) === 'undefined' ? '#E0E0E0' : options.keyColor,
        textColor: typeof(options.textColor) === 'undefined' ? '#555555' : options.textColor,
        capsLightColor: typeof(options.capsLightColor) === 'undefined' ? '#163EFF' : options.capsLightColor,
        enterKey: typeof(options.enterKey) === 'undefined' ? '' : options.enterKey,
        tabKey: typeof(options.tabKey) === 'undefined' ? '' : options.tabKey,
        ctrlKey: typeof(options.ctrlKey) === 'undefined' ? '' : options.ctrlKey,
        altKey: typeof(options.altKey) === 'undefined' ? '' : options.altKey,
        spareKey: typeof(options.spareKey) === 'undefined' ? '' : options.spareKey,
        languageKey: typeof(options.languageKey) === 'undefined' ? '' : options.languageKey,
        keyboardPosition: typeof(options.keyboardPosition) === 'undefined' ? 'bottom' : options.keyboardPosition
    };

    //*****Quick cleanup of our language array.*****
    options.language = options.language.split(',');
    $.each(options.language, function(i, val) {
        options.language[i] = val.trim();
    });

    init();

    function init() {
        languageArrayPosition = 0;
        readKeyboardFile(options.language[languageArrayPosition]);

        //*****Add our event listeners once everything has been materialized.*****
        pageElement.on('focus', function() {
            $('.keyboard-wrapper').show();
            focusedInputField = $(this);
        });

        pageElement.on('blur', function() {
            //$('.keyboard-wrapper').hide();
        });

        //*****Listen for keypresses.*****
        $(document).on('click touch', '.keyboard-key', function() {
            handleKeypress($(this).data('keyval'));
        });
    }

    function selectKeyboardFile(params) {

    }

    function readKeyboardFile(file) {
        var keyData,
            deadkeyData,
            deadkeyLocation = '',
            deadkeyJSON = '';

        $.get('/languages/' + file + '.klc', function(data) {
            keyData = data.match(/\w+\u0009\w+\u0009[\u0009]?\w+\u0009\w+[@]?\u0009\w+[@]?\u0009[-]?\w+[@]?(\u0009[-]?\w+[@]?)?\u0009\u0009\/\//g);
            deadkeyLocation = data.indexOf('DEADKEY');
            if (deadkeyLocation > 0) {
                deadkeyData = data.slice(deadkeyLocation, data.indexOf('KEYNAME')).trim().split('DEADKEY');
                deadkeyData.splice(0, 1);
                $.each(deadkeyData, function(i, value) {
                    deadkeyJSON += '"' + value.trim().slice(0, 4) + '": "' + 1 + '", ';
                });
                deadkeyJSON = deadkeyJSON.slice(0, -2);
                deadkeyJSON = '{' + deadkeyJSON + '}';
                deadkeyJSON = JSON.parse(deadkeyJSON);
                console.log(deadkeyJSON);
            }
            materializeKeyboard(keyData);
        });
    }

    //***********************************************************************************
    //*            This function handles the main buildout of our keyboard.             *
    //***********************************************************************************
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

        destroyKeyboard();

        $('body').append('<div class="keyboard-wrapper"></div>');

        generateRow(rowData_1);
        generateRow(rowData_2);
        generateRow(rowData_3);
        generateRow(rowData_4);

        setKeys('default');
        keyboardFillout();
        sizeKeys();
        keyboardAttributes();
    }

    //***********************************************************************************
    //*                  Append each key's individual JSON object.                      *
    //***********************************************************************************
    function appendKey(keyJSON) {
        $('.keyboard-row:last').append('<button class="keyboard-key keyboard-key-sm"></button>');
        $('.keyboard-key:last').data('keyDataJSON', keyJSON);
    }

    //***********************************************************************************
    //*                    Create row wrapper and fill with keys.                       *
    //***********************************************************************************
    function generateRow(keyListSplit) {
        var keyJSON, capsValue;
        $('.keyboard-wrapper').append('<div class="keyboard-row"></div>');
        $.each(keyListSplit, function(i, value) {
            keyJSON = { default: value[3], shift: value[4], altgrp: value[6] == '//' ? '-1' : value[6] };
            appendKey(keyJSON);
        });
    }

    //***********************************************************************************
    //*      Append our extra function keys that we didn't get from the .klc file.      *
    //***********************************************************************************
    function keyboardFillout() {
        $('.keyboard-row:eq(0)').append('<button class="keyboard-key keyboard-key-lg" data-keyval="backspace">Backspace</button>');
        $('.keyboard-row:eq(1)').prepend('<button class="keyboard-key keyboard-key-lg" data-keyval="tab">Tab</button>');
        $('.keyboard-row:eq(2)').prepend('<button class="keyboard-key keyboard-key-lg caps-lock-key" data-keyval="caps lock">Caps Lock</button>');
        $('.keyboard-row:eq(2)').append('<button class="keyboard-key keyboard-key-lg" data-keyval="enter">Enter</button>');
        $('.keyboard-row:eq(3)').prepend('<button class="keyboard-key keyboard-key-lg" data-keyval="shift">Shift</button>');
        $('.keyboard-row:eq(3)').append('<button class="keyboard-key keyboard-key-lg" data-keyval="shift">Shift</button>');
        $('.keyboard-wrapper').append('<div class="keyboard-row"></div>');
        $('.keyboard-row:eq(4)').append('<button class="keyboard-key keyboard-key-lg" data-keyval="ctrl">Ctrl</button>');
        $('.keyboard-row:eq(4)').append('<button class="keyboard-key keyboard-key-lg" data-keyval="language">Language</button>');
        $('.keyboard-row:eq(4)').append('<button class="keyboard-key keyboard-key-lg" data-keyval="alt">Alt</button>');
        $('.keyboard-row:eq(4)').append('<button class="keyboard-key keyboard-key-xl" data-keyval="space">&nbsp;</button>');
        $('.keyboard-row:eq(4)').append('<button class="keyboard-key keyboard-key-lg" data-keyval="alt grp">Alt Grp</button>');
        $('.keyboard-row:eq(4)').append('<button class="keyboard-key keyboard-key-lg" data-keyval="spare">&nbsp;</button>');
        $('.keyboard-row:eq(4)').append('<button class="keyboard-key keyboard-key-lg" data-keyval="ctrl">Ctrl</button>');
    }

    //***********************************************************************************
    //*              Adjust sizing of keys based on our enabled options.                *
    //***********************************************************************************
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

    //***********************************************************************************
    //*                Cycle key values based on depressed function keys.               *
    //***********************************************************************************
    function setKeys(keyType) {
        var keyJSON;

        if (keyStatusObject.caps && !keyStatusObject.shift && !keyStatusObject.altgrp) {
            //keyType = 'caps';
            keyType = 'default';
            $('.caps-lock-key').addClass('caps-lock-key-active');
        } else if (!keyStatusObject.caps && !keyStatusObject.shift && !keyStatusObject.altgrp) {
            keyType = 'default';
        }

        if (!keyStatusObject.caps) {
            $('.caps-lock-key').removeClass('caps-lock-key-active');
        }

        $('.keyboard-key').each(function() {
            try {
                keyJSON = $(this).data('keyDataJSON');
                if (keyJSON[keyType].length == 4) {
                    $(this).html('&#x' + keyJSON[keyType] + ';');
                    $(this).data('keyval', $(this).html());
                } else if (keyJSON[keyType].length == 5 && keyJSON[keyType].match('@')) {
                    $(this).html('&#x' + keyJSON[keyType].replace('@', '') + ';');
                    $(this).data('keyval', $(this).html());
                } else if (keyJSON[keyType] == '-1' || keyJSON[keyType].length == 0) {
                    $(this).html('&nbsp;');
                    $(this).data('keyval', '');
                } else {
                    $(this).html(keyJSON[keyType]);
                    $(this).data('keyval', $(this).html());
                }
            } catch (err) {
                //
            }

            if (!keyStatusObject.shift && keyStatusObject.caps && !keyStatusObject.altgrp) {
                $(this).html($(this).html().length == 1 ? $(this).html().toUpperCase() : $(this).html());
            }
        });
    }

    //***********************************************************************************
    //*     Read and subsequently write our depressed key to the appropriate form.      *
    //***********************************************************************************
    function handleKeypress(keyPressed) {
        keyPressed = keyPressed.replace('&lt;', '<').replace('&gt;', '>').replace(/\bspace/, ' '); //Acount for &lt; and &gt; escaping.
        if (keyPressed.length > 1) {
            switch (keyPressed) {
                case 'shift':
                    keyStatusObject.shift = keyStatusObject.shift ? false : true;
                    keyStatusObject.caps = false;
                    keyStatusObject.altgrp = false;
                    setKeys('shift');
                    break;
                case 'caps lock':
                    keyStatusObject.shift = false;
                    keyStatusObject.caps = keyStatusObject.caps ? false : true;
                    keyStatusObject.altgrp = false;
                    setKeys('caps');
                    break;
                case 'alt grp':
                    keyStatusObject.shift = false;
                    keyStatusObject.caps = false;
                    keyStatusObject.altgrp = keyStatusObject.altgrp ? false : true;
                    setKeys('altgrp');
                    break;
                case 'backspace':
                    focusedInputField.val(focusedInputField.val().slice(0, -1));
                    break;
                case 'space':
                    //Handled by replacement function above.
                    break;
                case 'enter':
                    //User-definable callback.
                    if (options.enterKey && typeof(options.enterKey) === 'function') {
                        options.enterKey();
                    }
                    break;
                case 'tab':
                    //User-definable callback.
                    if (options.tabKey && typeof(options.tabKey) === 'function') {
                        options.tabKey();
                    }
                    break;
                case 'ctrl':
                    //User-definable callback.
                    if (options.ctrlKey && typeof(options.ctrlKey) === 'function') {
                        options.ctrlKey();
                    }
                    break;
                case 'alt':
                    //User-definable callback.
                    if (options.altKey && typeof(options.altKey) === 'function') {
                        options.altKey();
                    }
                    break;
                case 'language':
                    console.log(languageArrayPosition);
                    if (languageArrayPosition + 1 <= options.language.length - 1) {
                        languageArrayPosition++;
                    } else {
                        languageArrayPosition = 0;
                    }
                    readKeyboardFile(options.language[languageArrayPosition]);
                    //User-definable callback.
                    if (options.languageKey && typeof(options.languageKey) === 'function') {
                        options.languageKey();
                    }
                    break;
                case 'spare':
                    //User-definable callback.
                    if (options.spareKey && typeof(options.spareKey) === 'function') {
                        optionsspareKey();
                    }
                    break;
            }
        } else {
            keyStatusObject.shift = false;
            keyStatusObject.altgrp = false;
            setKeys('default');
            focusedInputField.val(focusedInputField.val() + keyPressed);
        }
    }

    //***********************************************************************************
    //*                Provide some styling options for our keyboard.                   *
    //***********************************************************************************
    function keyboardAttributes() {
        var viewportWidth = $(window).width(),
            viewportHeight = $(window).height(),
            keyboardHeight = $('.keyboard-wrapper').height(),
            keyboardWidth = $('.keyboard-wrapper').width();
        $('.keyboard-key').css('background-color', options.keyColor);
        $('.keyboard-key').css('color', options.textColor);
        switch (options.keyboardPosition) {
            case 'top':
                $('.keyboard-wrapper').css('top', '20px');
                break;
            case 'middle':
                $('.keyboard-wrapper').css('top', ((viewportHeight - keyboardHeight) / 2).toString() + 'px');
                console.log(viewportHeight);
                console.log(keyboardHeight);
                console.log(((viewportHeight - keyboardHeight) / 2).toString() + 'px');
                break;
            default:
                $('.keyboard-wrapper').css('bottom', '20px');
        }
        $('.keyboard-wrapper').css('left', ((viewportWidth - keyboardWidth) / 2).toString() + 'px');
    }

    //***********************************************************************************
    //*                    Strip our keyboard element from page.                        *
    //***********************************************************************************
    function destroyKeyboard() {
        $('.keyboard-wrapper').remove();
    }

    //***********************************************************************************
    //*                         Listen for window resizing.                             *
    //***********************************************************************************
    $(window).resize(function() {
        //*****Prevent multiple function calls.*****
        if (!resizeTimerActive) {
            resizeTimerActive = true;
            var resizeDelay = setTimeout(function() {
                destroyKeyboard();
                init();
                resizeTimerActive = false;
            }, 500);
        }
    });
}
