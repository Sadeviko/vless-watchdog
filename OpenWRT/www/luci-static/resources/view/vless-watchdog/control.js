'use strict';
'require view';
'require fs';

return view.extend({
    load: function() {
        return fs.read('/opt/vless-watchdog/config.conf').catch(function() {
            return '';
        });
    },

    render: function(configContent) {
        var body = E('div', { 'class': 'cbi-map' }, [
            E('h3', {}, [
                'Use "|" as separator in "Blacklist Word" and "Excluded Countries".',
                E('br'),
                'Allowed characters between separator(A-Z, a-z, 0-9) "|", "-", "_"'
            ])
        ]);

        var values = {};
        if (configContent) {
            var lines = configContent.split('\n');
            for (var i = 0; i < lines.length; i++) {
                var match = lines[i].match(/^(PATH_XRAY_BIN|URL_SOURCE|URL_TEST|BLACKLIST_WORD|COUNTRY_EXCLUDE)="(.+)"$/);
                if (match) values[match[1]] = match[2];
            }
        }

        var params = [
            ['Xray Binary', 'PATH_XRAY_BIN'],
            ['Source URL', 'URL_SOURCE'],
            ['Test URL', 'URL_TEST'],
            ['Blacklist Word', 'BLACKLIST_WORD'],
            ['Excluded Countries', 'COUNTRY_EXCLUDE']
        ];

        for (var i = 0; i < params.length; i++) {
            var key = params[i][1];
            var div = E('div', { 'class': 'cbi-value', 'style': 'display: flex; align-items: center; padding: 5px 0;' });
            
            div.appendChild(E('label', { 
                'class': 'cbi-value-title', 
                'style': 'width: 10px; padding-right: 10px; font-weight: bold; text-align: left; white-space: nowrap;'
            }, params[i][0]));
            
            var input = E('input', {
                'type': 'text',
                'class': 'cbi-input-text',
                'value': values[key] || '',
                'id': 'opt_' + key,
                'style': 'width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 3px; box-sizing: border-box;'
            });
            
            div.appendChild(E('div', { 'class': 'cbi-value-field', 'style': 'flex: 1;' }, input));
            body.appendChild(div);
        }

        var buttons = [
            ['Save settings', 'btn-primary', function() {
                var keys = ['PATH_XRAY_BIN', 'URL_SOURCE', 'URL_TEST', 'BLACKLIST_WORD', 'COUNTRY_EXCLUDE'];
                var hasError = false;
                
                for (var i = 0; i < keys.length; i++) {
                    var el = document.getElementById('opt_' + keys[i]);
                    var val = el.value;
                    el.style.borderColor = '';
                    el.style.backgroundColor = '';
                    
                    if ((keys[i] === 'BLACKLIST_WORD' || keys[i] === 'COUNTRY_EXCLUDE') && /[^a-zA-Z0-9|\-_]/.test(val)) {
                        hasError = true;
                        el.style.borderColor = 'red';
                        el.style.backgroundColor = '#fff0f0';
                    }
                }
                
                if (hasError) return;
                
                var content = '';
                for (var i = 0; i < keys.length; i++) {
                    var val = document.getElementById('opt_' + keys[i]).value;
                    if (val) content += keys[i] + '="' + val + '"\n';
                }
                fs.write('/opt/vless-watchdog/config.conf', content);
            }],
            ['Update source', 'btn-primary', function() { fs.exec('/bin/sh', ['/opt/vless-watchdog/vless-watchdog', 'update']); }],
            ['Build favorites', 'btn-primary', function() { fs.exec('/bin/sh', ['/opt/vless-watchdog/vless-watchdog', 'build']); }],
            ['Check connection', 'btn-success', function() { fs.exec('/bin/sh', ['/opt/vless-watchdog/vless-watchdog', 'main']); }],
            ['Next server', 'btn-warning', function() { fs.exec('/bin/sh', ['/opt/vless-watchdog/vless-watchdog', 'next']); }]
        ];

        var actions = E('div', { 'style': 'display: flex; gap: 8px; flex-wrap: wrap; margin-top: 15px;' });
        for (var i = 0; i < buttons.length; i++) {
            actions.appendChild(E('button', { 'class': 'btn ' + buttons[i][1], 'click': buttons[i][2] }, buttons[i][0]));
        }
        body.appendChild(actions);

        return body;
    },

    handleSaveApply: null,
    handleSave: null,
    handleReset: null
});
