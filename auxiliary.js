var keystrings = {
    set: 'KeyW',
    noset: 'KeyX',
    explain: 'KeyA',
    noexplain: 'KeyD',
    next: 'KeyS'
}

var makeHTML = function({cards, cards_bg="#AAA", response="", explain="", score=0, max_score, uid, trial_num, next=false} = {}) {
	var cards_width = .75
	var uid = uid.toString().padStart(3, '0')
	var trial_num = trial_num.toString().padStart(2, '0')

	var score_html = ''
    for (i = 0; i < score; i++) {
    	score_html += '<img src="images/coin.png" style="width:100%;display:block" />\n'
    }

    var explain_html = ''
    if(explain=='ask') {
    	explain_html = `
            <img src="images/help.png" onclick=keydown("${keystrings.explain}") style="height:25vh;margin:5vw"/>
            <img src="images/nohelp.png" onclick=keydown("${keystrings.noexplain}") style="height:25vh;margin:5vw"/>`
    } else if(explain=='no') {
    	explain_html = `
            <img src="images/help.png" style="height:25vh;margin:5vw;visibility:hidden"/>
            <img src="images/nohelp.png" style="height:25vh;margin:5vw;opacity:.75"/>
            `;
    } else if(explain=='set' || explain=='noset') {
    	var type = explain
    	explain_html = explainHTML(cards, cards_width, type)
    }

    var html = `
    <div style="position:relative">
    	<table cellpadding=0 style="width:100vw;border-collapse:collapse">
            <tr style="height:${explain_html ? 50 : 100}vh">
                <td rowspan=2 style="width:${1/max_score*100}vh;background:#000;vertical-align:bottom">
                	${score_html}
                </td>
                <td style="background:${cards_bg}">
                    <table style="width:100%">
                        <tr>
                            <td style="width:${(1-cards_width)*1/5*100}%"></td>
                            <td style="width:${cards_width*100}%">
                                ${cardsHTML(cards)}
                            </td>
                            <td style="width:${(1-cards_width)*4/5*100}%">
                                <img src="images/set.png" onclick=keydown("${keystrings.set}") style="width:75%;visibility:${ response=='noset' ? 'hidden' : 'visible' } "/>
                                <br><br>
                                <img src="images/noset.png" onclick=keydown("${keystrings.noset}") style="width:75%;visibility:${ response=='set' ? 'hidden' : 'visible' } "/>
                            </td>
                        </tr>
                    </table>
                </td>
                <td rowspan=2 style="width:10%;background:#000;vertical-align:middle">
                    <img src="images/next.png" onclick=keydown("${keystrings.next}") style="width:90%" ${next ? '' : 'hidden'} />
                </td>
            </tr>
            <tr style="height:50vh" ${explain_html ? '' : "hidden"}>
            	<td style="background:#AAA;position:relative">
            		${explain_html}
            	</td>
            </tr>
        </table>
        <p style="color:#FFF;position:absolute;bottom:0;right:10px;margin:0;font-size:2.5vh;line-height:normal">${uid + '.' + trial_num}</p>
    </div>
        `;
    return html
}

shapes = ['diamond','oval','squiggle']
textures = ['open','striped','solid']
colors = ['red','green','blue']

var cardsHTML = function(cards) {
    var html = '<table cellpadding=0 style="border-spacing:20px;width:100%"><tr>'
    for (i = 0; i < cards.length; i++) {
        var card = cards[i].toString()
        var num = card[0]
        var shape = shapes[card[1]-1]
        var texture = textures[card[2]-1]
        var color = colors[card[3]-1]
        html += '<td style="position:relative"><img src="images/card.png" style="width:100%;display:block;z-index:-1" />'
        for (j=0; j < num; j++) {
            var img = 'images/' + shape + '_' + texture + '_' + color + '.png'
            var yrel = 29 * .8 * 2 / 72 / 3  // icon's height relative to card's height
            var top = (1 - yrel * num - .1 * (num - 1)) / 2 + (yrel + .1) * j
            html += `<img src="${img}" style="width:80%;position:absolute;top:${top*100}%;left:10%;display:block" />`
        }
        html += '</td>'
    }
    html += `
    			<td style="position:relative">
    				<img src="images/card.png" style="width:100%;display:block;visibility:hidden" />
				</td>
			</tr>
		</table>
		`;
    return html
}

var explainHTML = function(cards, cards_width, type) {
    var attrs = [new Set(), new Set(), new Set(), new Set()]
    var html = `
		<table style="width:100%">
			<tr>
				<td style="width:${(1-cards_width)*1/5*100}%">
                    <img src="images/help.png" style="width:50%;opacity:.75" hidden/>
                </td>
				<td style="width:${cards_width*100}%">
					<table cellpadding=0 style="border-spacing:20px;width:100%">
						<tr>
		`;
	for (c = 0; c < cards.length; c++) {
		var card = cards[c].toString()
		var num = card[0]
		var shape = shapes[card[1]-1]
        var texture = textures[card[2]-1]
        var color = colors[card[3]-1]
        html += `
        	<td>
        		<img src="images/${shape}.png" style="width:80%" /><br>
        		<img src="images/${color}.png" style="width:80%" /><br>
        		<img src="images/${texture}.png" style="width:80%" /><br>
        		<img src="images/${num}.png" style="width:80%" />
    		</td>
    		`;
    	attrs[0].add(shape)
    	attrs[1].add(color)
    	attrs[2].add(texture)
    	attrs[3].add(num)
    }
    html += '<td>'
    for (a = 0; a < attrs.length; a++) {
    	var values = attrs[a]
    	if (values.size == 1) {
    		img = 'images/same.png'
    	} else if (values.size == 3) {
    		img = 'images/diff.png'
    	} else {
    		img = 'images/fail.png'
    	}
    	html += `<img src="${img}"" style="width:80%" />`
    	if (a < attrs.length - 1) {
    		html += '<br>'
    	}
    }
    html += `
    						</td>
    					</tr>
    				</table>
                <td style="width:${(1-cards_width)*4/5*100}%">
	    			<img src="images/${type}.png" style="width:75%" />
	    		</td>
			</tr>
		</table>
		`;
	return html
}

var makeInstruction = function({sideA, sideB='', isfirst=false, islast=false, uid=''  } = {}) {
    var html = `
        <div style="width:100vw;height:100vh;position:relative;display:table-cell;vertical-align:middle">
            <img src="${sideA}" style="width:${80*2/3}vw;opacity:${sideB ? .5 : 1}" /><img src="${sideB}" style="width:${80*1/3}vw" />
            <img src="${!isfirst ? 'instructions/leftkey.png' : ''}" onclick=keydown("leftarrow") style="position:absolute;left:0;bottom:0">
            <img id="${islast ? 'lastnext' : ''}" src="instructions/rightkey.png" onclick=keydown("rightarrow") style="position:absolute;right:0;bottom:0">
            <p style="position:absolute;top:0;right:10px;margin:0;font-size:2.5vh;line-height:normal">${uid}</p>
        <div>
        `;
    return html
}