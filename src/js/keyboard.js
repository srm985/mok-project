//***********************************************************************************
//*                                                                                 *
//*            MOK Project - Multilingual Onscreen Keyboard                         *
//*                                                                                 *
//*            Author: Sean McQuay (www.seanmcquay.com)                             *
//*                                                                                 *
//*            GitHub: https://github.com/srm985/mok-project                        *
//*                                                                                 *
//*            Started: March 2017                                                  *
//*            Version: 1.1.3                                                         *
//*                                                                                 *
//*            License: MIT (https://opensource.org/licenses/MIT)                   *
//*                                                                                 *
//***********************************************************************************

$.fn.keyboard = function (passedOptions) {

    var keyMap = { '29': 0, '02': 1, '03': 2, '04': 3, '05': 4, '06': 5, '07': 6, '08': 7, '09': 8, '0a': 9, '0b': 10, '0c': 11, '0d': 12, '10': 13, '11': 14, '12': 15, '13': 16, '14': 17, '15': 18, '16': 19, '17': 20, '18': 21, '19': 22, '1a': 23, '1b': 24, '2b': 25, '1e': 26, '1f': 27, '20': 28, '21': 29, '22': 30, '23': 31, '24': 32, '25': 33, '26': 34, '27': 35, '28': 36, '2c': 37, '2d': 38, '2e': 39, '2f': 40, '30': 41, '31': 42, '32': 43, '33': 44, '34': 45, '35': 46 },
        keyStatusObject = { shift: false, caps: false, altgrp: false, shift_altgrp: '' },
        pageElement = $(this),
        focusedInputField,
        resizeTimerActive = false,
        languageArrayPosition = 0,
        storedKeyboardObject = { keyboardFile: '', arrayPosition: '' },
        shiftStateObject,
        deadkeyObject,
        ligatureObject,
        deadkeyPressed = '',
        deadkeySet = false,
        textFlowDirection = 'LTR',
        keyboardOpen = false,
        keyboardWrapperPresent = false,
        inputFieldType = 'text',
        keyboardInputType = 'text',
        keyboardStreamField;

    const KEYBOARD_VERSION = '1.1.5';
    const LANGUAGE_KEY_DEFAULT = 'Language';
    const LANGUAGE_MAP_SPLIT_CHAR = ':';
    const TRIGGER_KEYBOARD_FLAG = 'triggerKeyboard';

    const CDN_LANGUAGES_DIRECTORY = `https://cdn.jsdelivr.net/npm/mok-project@${KEYBOARD_VERSION}/dist/languages`;

    // Build out our language list from input string.
    const constructLanguageList = (language) =>
        language.split(',').map(splitLanguage =>
            splitLanguage.trim());

    // Define our default options.
    const initOptions = ({
        acceptColor = '#2ECC71',
        acceptTextColor = '#FFFFFF',
        allowEnterAccept = true,
        allowEscapeCancel = true,
        altKey = '',
        blackoutColor = '25, 25, 25, 0.9',
        cancelColor = '#E74C3C',
        cancelTextColor = '#FFFFFF',
        capsLightColor = '#3498DB',
        ctrlKey = '',
        directEnter = false,
        enterKey = '',
        inputFieldRegex = { number: /^(-)?(((\d+)|(\d+\.(\d+)?)|(\.(\d+)?))([eE]([-+])?(\d+)?)?)?$/ },
        inputType = '',
        keyCharacterRegex = { number: /[0-9]|[eE]|\.|\+|-/, tel: /[0-9]|\.|\+|-|#|\(|\)/ },
        keyColor = '#E0E0E0',
        keyTextColor = '#555555',
        keyboardPosition = 'bottom',
        language = '',
        languageKey = '',
        languageKeyTextColor = '#3498db',
        showSelectedLanguage = false,
        spareKey = '',
        specifiedFieldsOnly = false,
        tabKey = ''
    }) => ({
        acceptColor,
        acceptTextColor,
        allowEnterAccept,
        allowEscapeCancel,
        altKey,
        blackoutColor,
        cancelColor,
        cancelTextColor,
        capsLightColor,
        ctrlKey,
        directEnter,
        enterKey,
        inputFieldRegex,
        inputType: setInputType(inputType),
        keyboardPosition,
        keyCharacterRegex,
        keyColor,
        keyTextColor,
        language: constructLanguageList(language),
        languageKey,
        languageKeyTextColor,
        showSelectedLanguage,
        spareKey,
        specifiedFieldsOnly,
        tabKey
    });

    const options = initOptions(passedOptions);

    //*****Define our attributes that we care about.*****
    var inputAttributes = {
        disabled: '',
        readonly: '',
        maxlength: '',
        min: '',
        max: '',
        placeholder: ''
    };

    //***********************************************************************************
    //*             Return our selected input types as a formatted string.              *
    //***********************************************************************************
    function setInputType(inputType) {
        var inputTypeArray = new Array(),
            formattedString = '';

        if (inputType !== undefined && inputType != '') {
            inputTypeArray = inputType.trim().split(',');
            $.each(inputTypeArray, function (i, value) {
                if (value.trim().toString() == 'contenteditable') {
                    formattedString += '[contenteditable="true"], ';
                } else if (value.trim().toString() == 'textarea') {
                    formattedString += 'textarea, ';
                } else {
                    formattedString += 'input[type="' + value.trim().toString() + '"], ';
                }
            });
            formattedString = formattedString.slice(0, -2);
        } else {
            formattedString = 'input[type="text"], input[type="number"], input[type="password"], input[type="search"], input[type="tel"], input[type="url"], textarea, [contenteditable="true"]';
        }
        return (formattedString);
    }

    init();

    function init() {
        readKeyboardFile();

        //*****Add our event listeners once everything has been materialized.*****
        pageElement.on('click touch', options.inputType, function () {
            const {
                specifiedFieldsOnly
            } = options;

            if ($(this).prop('class') != 'keyboard-input-field') {
                const tempElement = $(this);

                // Check if we're only allowing the keyboard on certain fields.
                if (specifiedFieldsOnly) {
                    const isTriggerField = tempElement.data(TRIGGER_KEYBOARD_FLAG) || false;

                    if (!isTriggerField) {
                        return;
                    }
                }

                //*****Let's capture a few attributes about our input field.*****
                $.each(inputAttributes, function (i) {
                    inputAttributes[i] = tempElement.prop(i) === undefined ? '' : tempElement.prop(i);
                });

                if (!inputAttributes.disabled && !inputAttributes.readonly) {
                    focusedInputField = $(this);
                    keyboardStreamField = focusedInputField;

                    //*****If direct enter enabled, don't bother.*****
                    if (!options.directEnter) {
                        keyboardStreamField = $('.keyboard-input-field');
                        if (focusedInputField.is('input')) {

                            inputFieldType = focusedInputField.prop('type');
                            keyboardInputType = inputFieldType == 'password' ? 'password' : 'text';

                            keyboardStreamField.prop('placeholder', inputAttributes.placeholder);
                            keyboardStreamField.val(focusedInputField.val());
                            keyboardStreamField.prop('type', keyboardInputType);
                        } else {
                            inputFieldType = 'text';
                            keyboardStreamField.val(focusedInputField.html());
                            keyboardStreamField.prop('type', 'text');
                        }
                        $('.keyboard-blackout-background').show();
                    }
                    //************************************************

                    $('.keyboard-wrapper').show();
                    keyboardOpen = true;
                    keyboardStreamField.focus();
                }
            }
        });

        //*****Listen for keypresses.*****
        $('body').on('click touch', '.keyboard-key', function () {
            var keyRegistered = $(this).data('keyval');
            handleKeypress(keyRegistered);
        });

        //*****Handle our keyboard close button.*****
        $(document).on('click touch', '.keyboard-cancel-button', function () {
            discardData();
        });

        //*****Handle our keyboard accept button.*****
        $(document).on('click touch', '.keyboard-accept-button', function () {
            acceptData();
        });

        //*****Handle closure of direct-enter keyboard on element clickaway.*****
        $(document).on('click touch', '*', function (e) {
            e.stopPropagation();
            if (keyboardOpen && options.directEnter) {
                var elementLayer = $(this);
                if (options.inputType.search(elementLayer.attr('type')) < 1 && options.inputType.search(elementLayer.prop('tagName').toLowerCase()) < 1 && elementLayer.prop('contenteditable') != 'true') {
                    while (elementLayer.parent().length && !elementLayer.hasClass('keyboard-wrapper')) {
                        elementLayer = elementLayer.parent();
                    }
                    if (!elementLayer.hasClass('keyboard-wrapper')) {
                        clearKeyboardState();
                        keyboardOpen = false;
                        readKeyboardFile();
                    }
                }
            }
        });

        //*****Provide a little functionality during external keyboard testing.*****
        $(document).on('keydown', function (e) {
            hardwareKeypress(e);
        });
    }

    //***********************************************************************************
    //*                    Handle specific hardware keypresses                          *
    //***********************************************************************************
    function hardwareKeypress(key) {
        if ($('.keyboard-wrapper').is(':visible')) {
            switch (key.which) {
                case 13:
                    if (options.allowEnterAccept) {
                        acceptData();
                        key.preventDefault();
                    }
                    break;
                case 27:
                    if (options.allowEscapeCancel) {
                        discardData();
                        key.preventDefault();
                    }
                    break;
            }
        }
    }

    //***********************************************************************************
    //*         Read our keyboard file and parse information into usable tables         *
    //***********************************************************************************
    function readKeyboardFile() {
        // Separate our language file name from mapped name.
        const selectedLanguageFileName = () => {
            const {
                language
            } = options;

            const languageFileName = language[languageArrayPosition]
                .split(LANGUAGE_MAP_SPLIT_CHAR)[0]
                .trim();

            return languageFileName;
        };

        const file = selectedLanguageFileName();

        if (storedKeyboardObject.keyboardFile != '' && storedKeyboardObject.arrayPosition == languageArrayPosition) {
            parseKeyboardFile(file, storedKeyboardObject.keyboardFile);
        } else {
            // Handle our keyboard file once successfully read.
            const handleSuccess = (data) => {
                storedKeyboardObject.keyboardFile = data;
                storedKeyboardObject.arrayPosition = languageArrayPosition;
                parseKeyboardFile(file, data);
            };

            // See if there is a local language file, otherwise default to CDN.
            $.get(`./languages/${file}.klc`).done((data) => {
                handleSuccess(data);
            }).fail(() => {
                // No local languages, try the CDN.
                $.get(`${CDN_LANGUAGES_DIRECTORY}/${file}.klc`, (data) => {
                    handleSuccess(data);
                });
            });
        }
    }

    //***********************************************************************************
    //*                      Parse information from keyboard file.                      *
    //***********************************************************************************
    function parseKeyboardFile(file, data) {
        var keyData,
            shiftStateData,
            shiftStateLocation = '',
            deadkeyData,
            deadkeyLocation = '',
            ligatureData,
            ligatureLocation = '',
            tempArr = new Array(),
            tempObject;

        shiftStateObject = '';
        deadkeyObject = '';
        ligatureObject = '';

        //*****Extract our keyboard key data.*****
        data = data.replace(/\u0000/g, '');
        keyData = data.match(/\d(\w)?\s+\w+\s+\d\s+(-1|\w+@?|%%)\s+(-1|\w+@?|%%)\s+(-1|\w+@?|%%)(\s+(-1|\w+@?|%%))?(\s+(-1|\w+@?|%%))?(\s+(-1|\w+@?|%%))?\s+\/\//g);

        //*****Extract our shift state data and convert to lookup table.*****
        shiftStateLocation = data.indexOf('SHIFTSTATE');
        if (shiftStateLocation > 0) {
            shiftStateData = data.slice(shiftStateLocation, data.indexOf('LAYOUT')).trim().split(/\n/g);
            shiftStateData.splice(0, 2);
            $.each(shiftStateData, function (i, value) {
                if (value.indexOf(':') == -1) {
                    shiftStateObject += '"default": ';
                } else if (value.indexOf('Shft  Ctrl Alt') != -1) {
                    shiftStateObject += '"shift_altgrp": ';
                } else if (value.indexOf('Shft  Ctrl') != -1) {
                    shiftStateObject += '"ctrl_shift": ';
                } else if (value.indexOf('Ctrl Alt') != -1) {
                    shiftStateObject += '"altgrp": ';
                } else if (value.indexOf('Ctrl') != -1) {
                    shiftStateObject += '"ctrl": ';
                } else if (value.indexOf('Shft') != -1) {
                    shiftStateObject += '"shift": ';
                }
                shiftStateObject += value.match(/\w{6}\s[0-9]/).toString().slice(-1) + ', ';
            });
            shiftStateObject = JSON.parse('{' + shiftStateObject.toString().slice(0, -2) + '}');
        }

        //*****Extract our deadkey data and convert to lookup table.*****
        deadkeyLocation = data.indexOf('DEADKEY');
        if (deadkeyLocation > 0) {
            deadkeyData = data.slice(deadkeyLocation, data.indexOf('KEYNAME')).trim().split('DEADKEY');
            deadkeyData.splice(0, 1);
            $.each(deadkeyData, function (i, value) {
                tempArr = value.split(/\n/g);
                tempArr.splice(0, 2);
                tempObject = '';
                $.each(tempArr, function (_i, _value) {
                    tempObject += '"' + _value.trim().slice(0, 4) + '": "' + _value.trim().slice(5, 9) + '", ';
                });
                tempObject = '{' + tempObject.slice(0, -2) + '}';
                deadkeyObject += '"' + value.trim().slice(0, 4) + '": ' + tempObject + ', ';
            });
            deadkeyObject = JSON.parse('{' + deadkeyObject.slice(0, -2) + '}');
        }

        //*****Extract our ligature-generated keys and convert to lookup table.*****
        ligatureLocation = data.indexOf('LIGATURE');
        if (ligatureLocation > 0) {
            ligatureData = data.slice(ligatureLocation, data.indexOf('KEYNAME')).trim().split(/\n/g);
            ligatureData.splice(0, 5);
            $.each(ligatureData, function (i, value) {
                if (value.indexOf('//') > 0) {
                    ligatureData[i] = value.trim().split('//')[0].trim().replace(/\t/g, ' ').replace('  ', ' ').replace('  ', ' ').split(' ');
                    ligatureData[i].splice(1, 1);
                    ligatureObject += '"' + ligatureData[i][0] + '": ';
                    ligatureData[i].splice(0, 1);
                    $.each(ligatureData[i], function (j, _value) {
                        ligatureData[i][j] = '"' + _value + '"';
                    });
                    ligatureObject += '[' + ligatureData[i] + '], ';
                }
            });
            ligatureObject = JSON.parse('{' + ligatureObject.slice(0, -2) + '}');
        }

        //*****Reverse input direction for specific languages.*****
        if (file == 'arabic') {
            textFlowDirection = 'RTL';
        } else {
            textFlowDirection = 'LTR';
        }

        materializeKeyboard(keyData);
    }

    //***********************************************************************************
    //*            This function handles the main buildout of our keyboard.             *
    //***********************************************************************************
    function materializeKeyboard(keyListString) {
        var keyList = keyListString.toString().split(','),
            keyObject = new Array(),
            keyMapArray = new Array(47);

        $.each(keyList, function (i, value) {
            keyObject[i] = value.toString().replace(/(\t+|\s+)/g, ' ');
            keyObject[i] = keyObject[i].split(' ');
            if (keyMap[keyObject[i][0]] !== undefined) {
                keyMapArray[keyMap[keyObject[i][0]]] = keyObject[i];
            }
        });

        if ($('.keyboard-wrapper').length) {
            destroyKeys();
            keyboardWrapperPresent = true;
        } else {
            $('body').prepend('<div class="keyboard-wrapper"></div>');
            //*****If direct enter enabled, don't bother.*****
            if (!options.directEnter) {
                $('body').prepend('<div class="keyboard-blackout-background"></div>');
            }
            keyboardWrapperPresent = false;
        }

        generateRow(keyMapArray.slice(0, 13));
        generateRow(keyMapArray.slice(13, 26));
        generateRow(keyMapArray.slice(26, 37));
        generateRow(keyMapArray.slice(37, 47));

        setKeys('default');
        keyboardFillout();
        sizeKeys();
        keyboardAttributes();
        if (!keyboardOpen) {
            //*****If direct enter enabled, don't bother.*****
            if (!options.directEnter) {
                $('.keyboard-blackout-background').hide();
            }
            $('.keyboard-wrapper').hide();
        }
    }

    //***********************************************************************************
    //*                    Append each key's individual object.                         *
    //***********************************************************************************
    function appendKey(keyObject) {
        $('.keyboard-row:last').append('<button class="keyboard-key keyboard-key-sm"></button>');
        $('.keyboard-key:last').data('keyDataObject', keyObject);
    }

    //***********************************************************************************
    //*                    Create row wrapper and fill with keys.                       *
    //***********************************************************************************
    function generateRow(keyListSplit) {
        var keyObject;

        $('.keyboard-wrapper').append('<div class="keyboard-row"></div>');
        $.each(keyListSplit, function (i, value) {
            if (value !== undefined) {
                keyObject = { default: determineKey(value[shiftStateObject.default - 1], value[1]), shift: determineKey(value[shiftStateObject.shift - 1], value[1]), altgrp: determineKey(value[shiftStateObject.altgrp - 1], value[1]), shift_altgrp: determineKey(value[shiftStateObject.shift_altgrp - 1], value[1]) };
            } else {
                keyObject = { default: '-1', shift: '-1', altgrp: '-1', shift_altgrp: '-1' };
            }
            appendKey(keyObject);
        });
    }

    //***********************************************************************************
    //*                 Sort out deadkeys, ligature, and undefined.                     *
    //***********************************************************************************
    function determineKey(keyValue, VK) {
        var returnKey = keyValue;

        if (keyValue == '%%') {
            returnKey = ligatureObject[VK];
        } else if (keyValue === undefined) {
            returnKey = '-1';
        }

        return returnKey;
    }

    //***********************************************************************************
    //*      Append our extra function keys that we didn't get from the .klc file.      *
    //***********************************************************************************
    function keyboardFillout() {
        const {
            language,
            languageKeyTextColor,
            showSelectedLanguage
        } = options;

        // Check if we have mapped language names, otherwise just use file name.
        const generateLanguageName = () => {
            const extractedLanguage = language[languageArrayPosition].split(LANGUAGE_MAP_SPLIT_CHAR);

            let languageName = '';

            switch (extractedLanguage.length) {
                case 1:
                    languageName = extractedLanguage[0].toLowerCase().replace(/^\w/, c => c.toUpperCase());
                    break;
                case 2:
                    languageName = extractedLanguage[1].trim();
                    break;
                default:
                    languageName = LANGUAGE_KEY_DEFAULT;
            }

            return languageName;
        };

        const languageButtonText = showSelectedLanguage ? generateLanguageName() : LANGUAGE_KEY_DEFAULT;

        if (!$('.keyboard-action-wrapper').length && !options.directEnter) {
            $('.keyboard-wrapper').prepend('<div class="keyboard-action-wrapper"><button class="keyboard-action-button keyboard-cancel-button">Cancel</button><input type="text" class="keyboard-input-field"><button class="keyboard-action-button keyboard-accept-button">Accept</button></div>');
        }
        $('.keyboard-row:eq(0)').append('<button class="keyboard-key keyboard-key-lg" data-keyval="backspace">Backspace</button>');
        $('.keyboard-row:eq(1)').prepend('<button class="keyboard-key keyboard-key-lg" data-keyval="tab">Tab</button>');
        $('.keyboard-row:eq(2)').prepend('<button class="keyboard-key keyboard-key-lg caps-lock-key" data-keyval="caps lock">Caps Lock</button>');
        $('.keyboard-row:eq(2)').append('<button class="keyboard-key keyboard-key-lg" data-keyval="enter">Enter</button>');
        $('.keyboard-row:eq(3)').prepend('<button class="keyboard-key keyboard-key-lg" data-keyval="shift">Shift</button>');
        $('.keyboard-row:eq(3)').append('<button class="keyboard-key keyboard-key-lg" data-keyval="shift">Shift</button>');
        $('.keyboard-wrapper').append('<div class="keyboard-row"></div>');
        $('.keyboard-row:eq(4)').append('<button class="keyboard-key keyboard-key-lg" data-keyval="ctrl">Ctrl</button>');
        $('.keyboard-row:eq(4)').append(`<button class="keyboard-key keyboard-key-lg language-button" data-keyval="language">
        <span style="color: ${languageKeyTextColor};" data-keyval="language">${languageButtonText}</span>
        </button>`);
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

        $('.keyboard-row').each(function () {
            smallKeys = $(this).children('.keyboard-key-sm').length;
            largeKeys = $(this).children('.keyboard-key-lg').length;
            xlargeKeys = $(this).children('.keyboard-key-xl').length;
            largeKeyWidth = (rowWidth - ((smallKeys + largeKeys + xlargeKeys) * keyPadding) - (smallKeys * smallKeyWidth) - (xlargeKeys * xlargeKeyWidth)) / largeKeys;
            $(this).children('.keyboard-key-sm').css('cssText', `width: ${smallKeyWidth}px`);
            $(this).children('.keyboard-key-lg').css('cssText', `width: ${largeKeyWidth}px`);
            $(this).children('.keyboard-key-xl').css('cssText', `width: ${xlargeKeyWidth}px`);
        });
    }

    //***********************************************************************************
    //*                Cycle key values based on depressed function keys.               *
    //***********************************************************************************
    function setKeys(keyType) {
        var currentKey,
            keyObject,
            tempString = '';

        //*****Set keyboard to default and capitalize letters.*****
        if (keyStatusObject.caps && !keyStatusObject.shift && !keyStatusObject.altgrp) {
            keyType = 'default';
            $('.caps-lock-key').addClass('caps-lock-key-active');
        } else if (!keyStatusObject.caps && !keyStatusObject.shift && !keyStatusObject.altgrp) {
            keyType = 'default';
        }

        if (!keyStatusObject.caps) {
            $('.caps-lock-key').removeClass('caps-lock-key-active');
        }

        //*****If we didn't just press [Shift] + [Alt Grp], clear our tracker.*****
        if (keyStatusObject.shift_altgrp != '' && keyType != 'shift_altgrp') {
            keyStatusObject.shift_altgrp = '';
        }

        $('.keyboard-key').each(function () {
            tempString = '';
            try {
                currentKey = $(this)
                keyObject = currentKey.data('keyDataObject');
                if (keyObject[keyType].length == 4) {
                    currentKey.html('&#x' + keyObject[keyType] + ';');
                    currentKey.data('keyval', currentKey.html());
                } else if (keyObject[keyType].length == 5 && keyObject[keyType].match('@')) {
                    currentKey.html('&#x' + keyObject[keyType].replace('@', '') + ';');
                    currentKey.data('keyval', currentKey.html());
                } else if (keyObject[keyType].constructor === Array) {
                    $.each(keyObject[keyType], function (i, value) {
                        tempString += '&#x' + value + ';';
                    });
                    currentKey.html(tempString);
                    currentKey.data('keyval', currentKey.html());
                } else if (keyObject[keyType] == '-1' || keyObject[keyType] == '%%' || keyObject[keyType].length == 0) {
                    currentKey.html('&nbsp;');
                    currentKey.data('keyval', '');
                } else {
                    currentKey.html(keyObject[keyType]);
                    currentKey.data('keyval', currentKey.html());
                }

                if (!keyStatusObject.shift && keyStatusObject.caps && !keyStatusObject.altgrp) {
                    currentKey.html(currentKey.html().length == 1 ? currentKey.html().toUpperCase() : currentKey.html());
                    currentKey.data('keyval', currentKey.html().length == 1 ? currentKey.html() : currentKey.data('keyval'));
                }
            } catch (err) {
                //Nada Aquí
            }

        });
    }

    //***********************************************************************************
    //*     Read and subsequently write our depressed key to the appropriate form.      *
    //***********************************************************************************
    function handleKeypress(keyPressed) {
        //*****Convert deadkey to hex and pad with zeros to ensure it's four digits.*****
        var deadkeyLookup = ('0000' + keyPressed.charCodeAt(0).toString(16)).slice(-4),
            caretPosition = keyboardStreamField[0].selectionStart;

        keyPressed = keyPressed.replace('&lt;', '<').replace('&gt;', '>').replace(/\bspace/, ' '); //Acount for &lt; and &gt; escaping.

        if (keyPressed.length > 2) {
            deadkeyPressed = '';
            switch (keyPressed) {
                case 'shift':
                    keyStatusObject.shift = keyStatusObject.shift ? false : true;
                    keyStatusObject.caps = false;
                    keyStatusObject.altgrp = false;
                    if (keyStatusObject.shift_altgrp == 'altgrp') {
                        setKeys('shift_altgrp');
                        keyStatusObject.shift_altgrp = '';
                    } else if (keyStatusObject.shift_altgrp == 'shift') {
                        setKeys('shift');
                        keyStatusObject.shift_altgrp = '';
                    } else {
                        setKeys('shift');
                        keyStatusObject.shift_altgrp = 'shift';
                    }
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
                    if (keyStatusObject.shift_altgrp == 'shift') {
                        setKeys('shift_altgrp');
                        keyStatusObject.shift_altgrp = '';
                    } else if (keyStatusObject.shift_altgrp == 'altgrp') {
                        setKeys('altgrp');
                        keyStatusObject.shift_altgrp = '';
                    } else {
                        setKeys('altgrp');
                        keyStatusObject.shift_altgrp = 'altgrp';
                    }
                    break;
                case 'backspace':
                    keyboardStreamField.val(keyboardStreamField.val().slice(0, caretPosition - 1) + keyboardStreamField.val().slice(caretPosition));
                    caretPosition -= 1;
                    keyboardStreamField.focus();
                    keyboardStreamField[0].selectionStart = caretPosition;
                    keyboardStreamField[0].selectionEnd = caretPosition;
                    break;
                case 'space':
                    //We insert a space character within the string each time the space bar is pressed.
                    break;
                case 'enter':
                    //User-definable callback.
                    if (options.enterKey && typeof (options.enterKey) === 'function') {
                        options.enterKey();
                    }
                    break;
                case 'tab':
                    //User-definable callback.
                    if (options.tabKey && typeof (options.tabKey) === 'function') {
                        options.tabKey();
                    }
                    break;
                case 'ctrl':
                    //User-definable callback.
                    if (options.ctrlKey && typeof (options.ctrlKey) === 'function') {
                        options.ctrlKey();
                    }
                    break;
                case 'alt':
                    //User-definable callback.
                    if (options.altKey && typeof (options.altKey) === 'function') {
                        options.altKey();
                    }
                    break;
                case 'language':
                    if (languageArrayPosition + 1 <= options.language.length - 1) {
                        languageArrayPosition++;
                    } else {
                        languageArrayPosition = 0;
                    }
                    clearKeyboardState();
                    readKeyboardFile();
                    //User-definable callback.
                    if (options.languageKey && typeof (options.languageKey) === 'function') {
                        options.languageKey();
                    }
                    break;
                case 'spare':
                    //User-definable callback.
                    if (options.spareKey && typeof (options.spareKey) === 'function') {
                        //optionsspareKey();
                    }
                    break;
            }
        } else {
            keyStatusObject.shift = false;
            keyStatusObject.altgrp = false;
            setKeys('default');
            deadkeyPressed = deadkeyObject[deadkeyLookup];
            if (deadkeyPressed || deadkeySet) {
                keyPressed = '';
                if (deadkeyPressed === undefined && deadkeySet) {
                    var combinedKey = String.fromCharCode('0x' + deadkeySet[deadkeyLookup]);
                    if (combinedKey && deadkeySet[deadkeyLookup] !== undefined) {
                        keyPressed = combinedKey;
                    }
                }
                deadkeySet = deadkeyPressed;
            }

            //*****Write key value and update input attributes.*****
            keyboardStreamField.attr('dir', textFlowDirection);
            //*****Store before and after copies in case we need to revert.*****
            var tempString = keyboardStreamField.val(),
                newString;

            keyboardStreamField.val(keyboardStreamField.val().slice(0, caretPosition) + keyPressed + keyboardStreamField.val().slice(caretPosition));
            newString = keyboardStreamField.val();

            //*****Here we check if adding a character violated any user-defined rules. We check after the fact because of ligature and dead keys.*****
            if ((inputAttributes.maxlength != '-1' && inputAttributes.maxlength != '' && newString.length > inputAttributes.maxlength) || (inputFieldType == 'number' && inputAttributes.max != '' && inputAttributes.max != '-1' && (newString * 1) > (inputAttributes.max * 1)) || (inputFieldType == 'number' && inputAttributes.min != '' && inputAttributes.min != '-1' && (newString * 1) < (inputAttributes.min * 1)) || keyPressed.search(options.keyCharacterRegex[inputFieldType]) < 0 || newString.search(options.inputFieldRegex[inputFieldType]) < 0) {
                keyboardStreamField.val(tempString);
                caretPosition--;
            }
            //*****************************************************************************************************************************************

            //*****Return focus and update caret position.*****
            caretPosition += keyPressed.length;
            keyboardStreamField.focus();
            keyboardStreamField[0].selectionStart = caretPosition;
            keyboardStreamField[0].selectionEnd = caretPosition;
        }
    }

    //***********************************************************************************
    //*                       Discard keyboard data and close.                          *
    //***********************************************************************************
    function discardData() {
        keyboardStreamField.val('');
        clearKeyboardState();
        keyboardOpen = false;
        readKeyboardFile();
    }

    //***********************************************************************************
    //*                   Submit keyboard data to form and close.                       *
    //***********************************************************************************
    function acceptData() {
        if (focusedInputField.is('input')) {
            focusedInputField.val(keyboardStreamField.val());
        } else {
            focusedInputField.html(keyboardStreamField.val());
        }
        keyboardStreamField.val('');
        clearKeyboardState();
        keyboardOpen = false;
        readKeyboardFile();
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
        $('.keyboard-key').css('color', options.keyTextColor);
        //*****If direct enter enabled, don't bother setting these.*****
        if (!options.directEnter) {
            $('.keyboard-cancel-button').css('background-color', options.cancelColor);
            $('.keyboard-cancel-button').css('color', options.cancelTextColor);
            $('.keyboard-accept-button').css('background-color', options.acceptColor);
            $('.keyboard-accept-button').css('color', options.acceptTextColor);
            $('.keyboard-blackout-background').css('background-color', 'rgba(' + options.blackoutColor + ')');
        }
        //**************************************************************
        switch (options.keyboardPosition) {
            case 'top':
                $('.keyboard-wrapper').css('top', '20px');
                break;
            case 'middle':
                $('.keyboard-wrapper').css('top', ((viewportHeight - keyboardHeight) / 2).toString() + 'px');
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
        clearKeyboardState();
        $('.keyboard-wrapper').remove();
    }

    //***********************************************************************************
    //*                      Strip keys from keyboard element.                          *
    //***********************************************************************************
    function destroyKeys() {
        clearKeyboardState();
        $('.keyboard-row').remove();
    }

    //***********************************************************************************
    //*                  Reset all of our keyboard function keys.                       *
    //***********************************************************************************
    function clearKeyboardState() {
        for (var property in keyStatusObject) {
            if (keyStatusObject.hasOwnProperty(property)) {
                keyStatusObject[property] = false;
            }
        }
    }

    //***********************************************************************************
    //*                         Listen for window resizing.                             *
    //***********************************************************************************
    $(window).resize(function () {
        //*****Prevent multiple function calls.*****
        if (!resizeTimerActive) {
            resizeTimerActive = true;
            setTimeout(function () {
                readKeyboardFile();
                resizeTimerActive = false;
            }, 500);
        }
    });
}
