'use strict';
'require view';
'require fs';

return view.extend({
    load: function() {
        return fs.read('/var/run/vless-watchdog/favorites.txt').catch(function() {
            return '';
        });
    },

    render: function(favoritesContent) {
        var body = E('div', { 'class': 'cbi-map' }, [
            E('h3', {}, 'List of favorite servers (max 15), sorted from fastest to slowest.')
        ]);

        if (!favoritesContent || favoritesContent.trim() === '') {
            body.appendChild(E('div', { 'class': 'alert-message warning' }, 'Warning: Favorites list empty. Use vless-watchdog build'));
            return body;
        }

        var ul = E('ul', { 'style': 'list-style: none; padding: 0; margin: 0;' });
        var lines = favoritesContent.split('\n');
        var index = 1;

        for (var i = 0, len = lines.length; i < len; i++) {
            var line = lines[i].trim();
            if (!line) continue;

            var pipeIndex = line.lastIndexOf('|');
            if (pipeIndex === -1) continue;

            var jsonStr = line.substring(0, pipeIndex).trim();
            if (!jsonStr) continue;

            try {
                var data = JSON.parse(jsonStr);
                if (!data.address || !data.port) continue;

                var li_content = [
                    index + ') ',
                    E('strong', {}, data.address + ':' + data.port),
                    ' [' + data.type + '/' + data.security + ']',
                    ' 🌍 ' + line.substring(pipeIndex + 1).trim()
                ];

                ul.appendChild(E('li', { 
                    'style': 'padding: 6px 10px; border-bottom: 1px solid var(--border-color, #eee);' 
                }, li_content));
                index++;

            } catch (e) {
                continue;
            }
        }

        body.appendChild(ul);
        return body;
    },

    handleSaveApply: null,
    handleSave: null,
    handleReset: null
});
