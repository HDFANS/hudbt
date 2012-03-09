$(function() {
    var lang = hb.constant.lang;
    var base = hb.constant.url.base;
    var title = $('title');
    var origTitle = title.text();
    var checkInt = 120;
    var alertMsg = $('#alert-message');
    var timerMouse;
    var dialogOpen = false;
    var mouseoverTime = 1;

    var checkMsg = function() {
	$.getJSON('/messages.php?format=json&unread=yes', function(result) {
	    if (result.length !== 0) {
		title.text('(' + result.length + ') ' + origTitle);
		if (alertMsg.length === 0) {
		    alertMsg = $('<li></li>', {
			style : 'background-color: red',
			id : 'alert-message'
		    }).append($('<a></a>', {
			href : '//' + base + '/messages.php'
		    }));
		    $('#alert').append(alertMsg);
		}
		    
		alertMsg.find('a').text(lang.text_you_have + result.length + lang.text_new_message + lang.text_click_here_to_read);
		if (location.pathname.split('/').pop() !== 'messages.php') {
		    alertMsg.unbind('mouseover').mouseover(function() {
			if (!timerMouse && !dialogOpen) {
			    timerMouse = setTimeout(function() {
				var text = '<table cellpadding="2" class="no-vertical-line"><thead><th>主题</th><th>发信人</th><th class="unsortable"></th><th class="unsortable">预览</th></thead><tbody>' + $.map(result, function(msg) {
				    var t = '<tr><td><a href="//' + base + '/messages.php?action=viewmessage&amp;id=' + msg.id + '" title="' + msg.added + '">' + msg.subject + '</a></td><td>';
				    if (msg.sender.id !== 0) {
					var userClass = msg.sender['class'].canonical;
					var userCss = userClass.replace(/\s/g, '') + '_Name username';
					t += '<a href="//' + base + '/userdetails.php?id=' + msg.sender.id + '" class="' + userCss + '">';
				    }
				    t += msg.sender.username;
				    if (msg.sender.id !== 0) {
					t += '</a>';
				    }
				    t += '</td><td>';
				    if (msg.sender.id !== 0 && msg.sender.id != hb.config.user.id) {
					t += '<a href=//' + base + '/sendmessage.php?receiver=' + msg.sender.id + '&amp;replyto=' + msg.id + '>' + '回复' + '</a>';
				    }
				    t += '</td><td><div class="alert-message-body">' + msg.msg + '</div></td></tr>';
				    return t;
				}).join('') + '</tbody></table>';

				dialogOpen = true;
				var dialog = $('<div></div>', {
				    title : '站内信',
				    html : text
				});
				dialog.dialog({
				    autoOpen : true,
				    position : 'right',
				    width : '500px',
				    'close' : function() {
					dialogOpen = false;
					dialog.remove();
				    }
				}).find('table').tablesorter();
			    }, mouseoverTime * 1000);
			}
		    });
		    alertMsg.unbind('mouseout').mouseout(function() {
			if (timerMouse) {
			    clearTimeout(timerMouse);
			    timerMouse = undefined;
			}
		    });
		}
	    }
	    else {
		timerMouse = undefined;
		alertMsg.remove();
		title.text(origTitle);
	    }
	    setTimeout(checkMsg, checkInt * 1000);
	});
    };
    checkMsg();
});