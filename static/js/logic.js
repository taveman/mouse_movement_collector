(function (){

    function drop_all_selects() {
        var all_nodes = document.querySelectorAll('select');
        all_nodes.forEach(function(n) {
            n.selectedIndex = "0";
        });
    }
    function main_logic() {
        var form_1 = document.getElementById('form_bank_1'),
            form_2 = document.getElementById('form_bank_2'),
            send_form_button = document.getElementById('js-send_button'),
            select_balance_input = document.getElementById('js-bank_1_amount'),
            balance_output = document.getElementById('js-bank_2_amount'),
            select_elem_form_1 = document.getElementById('select_to_be_sent'),
            sent_but = document.getElementById('send_button'),
            recv_but = document.getElementById('receive_button'),
            warning_div = document.getElementById('waring'),

            form_surname = document.getElementById('surname'),
            form_age = document.getElementById('age'),
            form_left_handed = document.getElementById('left_handed'),
            form_channel = document.getElementById('channel'),
            form_device = document.getElementById('device'),
            form_virtual = document.getElementById('virtual'),
            form_remote_tool = document.getElementById('remote_tool'),
            form_os = document.getElementById('os');

        var select_send_ok = false,
            select_amount_ok = false,
            pending_amount = 0,
            total_amount_recv = 0,
            target_amount = '250';

        function generateMarker() {
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }

        function check_if_can_send() {
            if (select_send_ok && select_amount_ok) {
                sent_but.removeClass('pure-button-disabled');
            } else {
                sent_but.addClass('pure-button-disabled');
            }
        }
        function check_if_done() {
            if (balance_output.value > 10000) {
                send_form_button.removeClass('pure-button-disabled');
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
                || !form_remote_tool.options[form_os.selectedIndex].value) {
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

        send_form_button.onclick = function () {
            if (!check_if_all_filled()) {
                show_warning(true);
            } else {
                show_warning(false);
                var obj_to_send = {
                    'surname': form_surname.value,
                    'age': form_age.value,
                    'lefthanded': form_left_handed.options[form_left_handed.selectedIndex].value,
                    'channel': form_channel.options[form_channel.selectedIndex].value,
                    'device': form_device.options[form_device.selectedIndex].value,
                    'vm': form_virtual.options[form_virtual.selectedIndex].value,
                    'os': form_os.options[form_os.selectedIndex].value,
                    'remote_tool': form_remote_tool.options[form_os.selectedIndex].value,
                    'marker': generateMarker()
                };
                console.log(obj_to_send);
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

        sent_but.onclick = function () {
            if (!select_amount_ok || ! select_send_ok) {
                return
            }
            select_amount_ok = false;
            select_send_ok = false;
            pending_amount = select_balance_input.options[select_balance_input.selectedIndex].value;
            recv_but.removeClass('pure-button-disabled');
            check_if_can_send();
        };

        recv_but.onclick = function () {
            total_amount_recv += parseInt(pending_amount, 10);
            pending_amount = 0;
            balance_output.value = total_amount_recv;
            check_if_done();
        }

    }

    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", function() {
            drop_all_selects();
            main_logic();
        });
    } else {
        drop_all_selects();
        main_logic();
    }
})();