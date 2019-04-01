(function () {

    function drop_all_selects() {
        var all_nodes = document.querySelectorAll('select');
        all_nodes.forEach(function(n) {
            n.selectedIndex = "0";
        });
        var all_inputs = document.querySelectorAll('input');
        all_inputs.forEach(function(n) {
            n.value = "";
        });
    }
    function main_logic(rm_manager) {
        var form_1 = document.getElementById('form_bank_1'),
            form_2 = document.getElementById('form_bank_2'),
            send_form_button = document.getElementById('js-send_button'),
            select_balance_input = document.getElementById('js-bank_1_amount'),
            balance_output = document.getElementById('js-bank_2_amount'),
            select_elem_form_1 = document.getElementById('select_to_be_sent'),
            sent_but = document.getElementById('send_button'),
            recv_but = document.getElementById('receive_button'),
            warning_div = document.getElementById('warning'),

            form_surname = document.getElementById('surname'),
            form_age = document.getElementById('age'),
            form_left_handed = document.getElementById('left_handed'),
            form_channel = document.getElementById('channel'),
            form_grade = document.getElementById('grade'),
            form_device = document.getElementById('device'),
            form_virtual = document.getElementById('virtual'),
            form_remote_tool = document.getElementById('remote_tool'),
            form_gender = document.getElementById('gender'),
            form_os = document.getElementById('os');

        var select_send_ok = false,
            select_amount_ok = false,
            pending_amount = 0,
            total_amount_recv = 0,
            target_amount = '250',
            max_amount = 2000;

        function generateMarker() {
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }

        function check_if_can_send() {
            if (select_send_ok && select_amount_ok) {
                sent_but.classList.remove('pure-button-disabled');
            } else {
                sent_but.classList.add('pure-button-disabled');
            }
        }
        function check_if_done() {
            if (balance_output.value >= max_amount) {
                send_form_button.classList.remove('pure-button-disabled');
            }
        }

        function check_if_all_filled() {
            if (!form_surname.value
                || !form_age.value
                || !form_left_handed.options[form_left_handed.selectedIndex].value
                || !form_channel.options[form_channel.selectedIndex].value
                || !form_device.options[form_device.selectedIndex].value
                || !form_virtual.options[form_virtual.selectedIndex].value
                || !form_os.options[form_os.selectedIndex].value
                || !form_grade.options[form_grade.selectedIndex].value
                || !form_remote_tool.options[form_remote_tool.selectedIndex].value
                || !form_gender.options[form_gender.selectedIndex].value) {
                return false;
            }
            return true;
        }

        function show_warning(show) {
            if (show) {
                warning_div.style.display = 'block';
            } else {
                warning_div.style.display = 'none';
            }
        }
        function clean_all_up(resp) {
            alert('Запишите текущий номер замера: ' + resp['marker']);
            drop_all_selects();
            rm_manager.previousState.timeSlotKeeper = [];
            balance_output.value = 0;
            check_if_can_send();
        }

        send_form_button.onclick = function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!check_if_all_filled()) {
                show_warning(true);
            } else {
                show_warning(false);
                var container = new DataContainer();
                var obj_to_send = {
                    'surname': form_surname.value,
                    'age': form_age.value,
                    'lefthanded': form_left_handed.options[form_left_handed.selectedIndex].value !== "0",
                    'channel': form_channel.options[form_channel.selectedIndex].value,
                    'device': form_device.options[form_device.selectedIndex].value,
                    'vm': form_virtual.options[form_virtual.selectedIndex].value !== "0",
                    'os': form_os.options[form_os.selectedIndex].value,
                    'grade': form_grade.options[form_grade.selectedIndex].value,
                    'remote_tool': form_remote_tool.options[form_remote_tool.selectedIndex].value,
                    'gender': form_gender.options[form_gender.selectedIndex].value,
                    'marker': generateMarker(),
                    'time_slots': rm_manager.previousState.timeSlotKeeper,
                    'movements': rm_manager.previousState.movements
                };
                container.extend(obj_to_send);
                send_data('POST', container, '/remote/' ,clean_all_up);
            }

        };

        select_elem_form_1.onchange = function() {
            var val = select_elem_form_1.options[select_elem_form_1.selectedIndex].value;
            val === 'bank_2' ? select_send_ok = true : select_send_ok = false;
            check_if_can_send();
        };
        select_balance_input.onchange = function () {
            var val = select_balance_input.options[select_balance_input.selectedIndex].value;
            val === target_amount ? select_amount_ok = true : select_amount_ok = false;
            check_if_can_send();
        };

        sent_but.onclick = function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!select_amount_ok || ! select_send_ok) {
                return
            }

            select_amount_ok = false;
            select_send_ok = false;
            pending_amount = select_balance_input.options[select_balance_input.selectedIndex].value;
            recv_but.classList.remove('pure-button-disabled');
            select_balance_input.selectedIndex = "0";
            select_elem_form_1.selectedIndex = "0";
            check_if_can_send();
        };

        recv_but.onclick = function (e) {
            e.stopPropagation();
            e.preventDefault();
            total_amount_recv += parseInt(pending_amount, 10);
            pending_amount = 0;
            balance_output.value = total_amount_recv;
            recv_but.classList.add('pure-button-disabled');
            check_if_done();
        }

    }


    // -------------------------------------------------------


    function RemoteDetectionManager() {
        var that = this;
        this.previousState = {
            timeMoved: null,
            positionX: null,
            positionY: null,
            totalCount: 0,
            prevMean: 0,
            currMean: 0,
            timeSlotKeeper: [],
            movements: []
        };
        this.init = function () {
            document.addEventListener("mousemove", that.mousemoveCallBack);
            that.inited = true;
        };
        this.flush = function () {
            var toSend = new DataContainer();
            toSend.data = {
                timeSlots: that.previousState.timeSlotKeeper
            };
            send_data('POST', toSend, '/remote');
            that.previousState.timeSlotKeeper = [];
        };

        this.mousemoveCallBack = function (e) {
            var event = e || window.event;
            var timeNow = Date.now(),
                timeDiff = 0;
            if (!that.previousState.timeMoved) {
                that.previousState.timeMoved = timeNow;
            } else {
                timeDiff = timeNow - that.previousState.timeMoved;
                that.previousState.timeMoved = timeNow;
            }
            that.previousState.positionX = event.x || event.pageX;
            that.previousState.positionY = event.y || event.pageY;
            that.previousState.totalCount += 1;
            if (timeDiff) {
                that.previousState.timeSlotKeeper.push(timeDiff);
                that.previousState.movements.push({
                    'time': timeDiff,
                    'x': that.previousState.positionX,
                    'y': that.previousState.positionY
                })
            }
        }
    }

    function DataContainer() {
        this.data = {};
        this.extend = function(obj) {
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    this.data[i] = obj[i];
                }
            }
        }
    }

    var localStorageManager = (function() {
        var __hasLocalStorage = (function() {
            if (window && window.localStorage) {
                try {
                    window.localStorage.setItem("__t", 1);
                    window.localStorage.removeItem("__t");
                    return true;
                } catch (e) {
                    return false;
                }
            }
            return false;
        }());

        var __saveToCookie = function(key, value, needRemove) {
            var date = new Date(),
                expire;
            if (!needRemove) {
                date.setTime(date.getTime() + (30*24*60*60*1000));
                date = date.toUTCString();
            } else {
                date = "Thu, 01 Jan 1970 00:00:01 GMT"
            }
            expire = "; expires=" + date;

            document.cookie = key + "=" + value + expire + "; path=/";
        };

        var __saveToLocalStorage = function (key, val) {
            if (!__hasLocalStorage) {
                __saveToCookie(key, val);
            } else {
                window.localStorage.setItem(key, val);
            }
        };

        var __getFromCookie = function(key) {
            var cookies = document.cookie.split(";"),
                i;
            key += "=";
            for (i = 0; i < cookies.length; i += 1) {
                var cookie = cookies[i];
                while (cookie.charAt(0) === " ") {
                    cookie = cookie.substring(1, cookie.length);
                }
                if (cookie.indexOf(key) === 0) {
                    return cookie.substring(key.length, cookie.length);
                }
            }
            return '';
        };

        var __getFromStorage = function (key) {
            if (!__hasLocalStorage) {
                return __getFromCookie(key);
            }
            return window.localStorage.getItem(key);
        };

        var __removeFromStorage = function (key) {
            if (!__hasLocalStorage) {
                __saveToCookie(key, "", true);
            } else {
                window.localStorage.removeItem(key);
            }
        };

        var __getAllValues = function () {
            var i,
                cookies,
                objToReturn = {};
            if (__hasLocalStorage) {
                return window.localStorage;
            }
            cookies = document.cookie.split(";");
            for (i = 0; i < cookies; i += 1) {
                var tmp = cookies[i].trim().split("=");
                objToReturn[tmp[0]] = tmp[1];
            }
            return objToReturn;

        };

        return {
            set: function (key, value) {
                __saveToLocalStorage(key, value);
            },
            get: function (key) {
                return __getFromStorage(key);
            },
            getFromCookies: function (key) {
                return __getFromCookie(key);
            },
            remove: function (key) {
                __removeFromStorage(key);
            },
            getAll: function () {
                return __getAllValues();
            }
        }
    }());

    function build_xhr(req_type, url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open(req_type, url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");
        // xhr.setRequestHeader("X-CSRFToken", getCSRFToken("csrftoken"));
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 400)) {
                var json = JSON.parse(xhr.responseText);
                if (callback) {
                    callback(json);
                }
            }
        };
        return xhr;
    }

    function send_data(request_type, data_to_send, url_passed, callback_function) {
        if (!data_to_send) {
            data_to_send = new DataContainer();
        }
        var data;
        data_to_send.data['device_cookie'] = localStorageManager.get('__cloud_safe');

        data = JSON.stringify(data_to_send.data);
        var xhr = build_xhr(request_type, url_passed, callback_function);
        xhr.send(data);
    }

    function checkCookie() {
        var c = localStorageManager.get('__cloud_safe'),
            setCookie = function(cookie_data) {
                localStorageManager.set('__cloud_safe', cookie_data['value']);
            };
        if (!c['__cloud_safe']) {
            var data = {
                data: {
                    action: 'refresh'
                }
            };
            send_data('POST', data, '/get_cookie', setCookie);
        }
    }

    var remoteDetectionManager = new RemoteDetectionManager();
    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", function() {
            remoteDetectionManager.init();
            drop_all_selects();
            main_logic(remoteDetectionManager);
        });
    } else {
        remoteDetectionManager.init();
        drop_all_selects();
        main_logic(remoteDetectionManager);
    }


})();