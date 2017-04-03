    function readTextFile(file) {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function() {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    var rawKeyboardData = rawFile.responseText;
                    rawKeyboardData = rawKeyboardData.match(/\w+\u0009\w+\u0009[\u0009]?\w+\u0009\w+[@]?\u0009\w+[@]?\u0009[-]?\w+[@]?\u0009[-]?\w+[@]?\u0009\u0009\/\//g);
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
    }

    function appendKey(keyCode) {
        if (keyCode.length == 4) {
            $('body').append('<div>&#x' + keyCode + '</div>');
        } else {
            $('body').append('<div>' + keyCode + '</div>');
        }
    }

    function generateRow(keyListSplit) {
        $.each(keyListSplit, function(i, value) {
            appendKey(value[3]);
        });
    }

    $(document).ready(function() {
        var file = 'albanian.klc';
        readTextFile(file);

        $(document).keydown()
    })