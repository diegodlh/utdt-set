function trialType(card1, card2, card3) {
    let sameMask = 0;
    let brokenMask = 0;

    // for each attribute
    for(let i=0; i<4; i++) {
        // count unique attribute values
        const uniqueCount = new Set([card1[i], card2[i], card3[i]]).size;

        if (uniqueCount === 1) sameMask |= (1 << i);
        if (uniqueCount === 2) brokenMask |= (1 << i);
    }

    if (brokenMask === 0) {
        return sameMask;
    } else {
        return -brokenMask;
    }
}

/**
 * Decodes a card index (decimal integer encoding a base-3 number)
 * into its four attribute values.
 *
 * @param {number} n - Card index (0–80).
 * @returns {number[]} Array of four attribute values (1-3).
 */
function decodeCard(n){
    const num = Math.floor(n/27) + 1;
    n %= 27;

    const shape = Math.floor(n/9) + 1;
    n %= 9;

    const texture = Math.floor(n/3) + 1;
    n %= 3;

    const color = n + 1;

    return [num, shape, texture, color];
}

function generateAllTrials() {
    const allTrials = {};

    let count = 0;
    for (let a=0; a<81;a++) {
        for (let b=a; b<81; b++) {
            for (let c=b; c<81; c++) {
                // do generate hypothetical trials with all cards the same
                // but do not generate trials with two cards the same
                if (new Set([a, b, c]).size == 2) continue;

                const card1 = decodeCard(a);
                const card2 = decodeCard(b);
                const card3 = decodeCard(c);
                const type = trialType(card1, card2, card3);

                count++;
                (allTrials[type] ??= []).push([
                    Number(card1.join("")),
                    Number(card2.join("")),
                    Number(card3.join("")),
                ]);
            }
        }
    }

    console.log(`Generated ${count} trials!`);
    return allTrials;
}

function shuffleCards(card1, card2, card3) {
    const cards = [card1, card2, card3];
    const shuffledCards = [];

    shuffledCards[0] = cards.splice(Math.floor(Math.random() * cards.length), 1)[0];
    shuffledCards[1] = cards.splice(Math.floor(Math.random() * cards.length), 1)[0];
    shuffledCards[2] = cards[0];

    return shuffledCards;
}