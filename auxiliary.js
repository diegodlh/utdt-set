// var cardsHTML = function(cards_img, score) {
// 	var html = `
// 		<div style="height: 50%; background: #AAA;">
// 			<img src="${cards_img}" />
// 			<img src="/images/choice_set.svg" />
// 		</div>
// 		`;
// 	return html
// }

// var explanationHTML = function(cards_img, score) {

// }

// var feedbackHTML = function(cards_img, explain_img, correct, score) {

// }

var makeHTML = function({cards_img, cards_bg="#AAA", response="", explain_img="", score=0, max_score} = {}) {
	var cards_width = .4

	var score_html = ''
    for (i = 0; i < score; i++) {
    	score_html += '<img src="images/coin.svg" style="width:100%;display:block" />\n'
    }
    var html = `
    	<table cellpadding=0 style="width:100vw;border-collapse:collapse">
            <tr style="height:50vh">
                <td rowspan=2 style="width:${1/max_score*100}vh;background:#000;vertical-align:bottom">
                	${score_html}
                </td>
                <td style="background:${cards_bg}">
                    <table style="width:100%">
                        <tr>
                            <td style="width:${(1-cards_width)/2*100}%"></td>
                            <td style="width:${cards_width*100}%">
                                <img src="${cards_img}" style="width:100%"/>
                            </td>
                            <td style="width:${(1-cards_width)/2*100}%">
                                <img src="images/set.png" style="max-width:100%;visibility:${ response=='noset' ? 'hidden' : 'visible' } "/><br>
                                <img src="images/noset.png" style="max-width:100%;visibility:${ response=='set' ? 'hidden' : 'visible' } "/>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr style="height:50vh;background:#AAA">
                <td>
                    <img src="${explain_img}" style="width:${20/11*.4*100}%"/>
                </td>
            </tr>
        </table>
        `;
    return html
}