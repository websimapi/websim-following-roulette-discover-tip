export class DiceManager {
    constructor() {
        this.diceArea = document.getElementById('diceArea');
        this.tipResult = document.getElementById('tipResult');
        this.dice = Array.from(this.diceArea.querySelectorAll('.die'));
    }
    
    roll(callback) {
        // Roll 5 dice
        const values = [];
        let completedDice = 0;
        
        this.dice.forEach((die, index) => {
            die.classList.add('rolling');
            
            setTimeout(() => {
                const value = Math.floor(Math.random() * 6) + 1;
                values[index] = value;
                completedDice++;
                
                const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
                die.textContent = faces[value - 1];
                die.dataset.value = value;
                
                die.classList.remove('rolling');
                
                // When all dice are done rolling
                if (completedDice === 5) {
                    const tipAmount = this.calculateTip(values);
                    if (callback) {
                        callback(tipAmount);
                    }
                }
            }, 1000);
        });
    }
    
    calculateTip(values) {
        const counts = {};
        values.forEach(value => {
            counts[value] = (counts[value] || 0) + 1;
        });
        
        const countValues = Object.values(counts);
        countValues.sort((a, b) => b - a);
        
        let tip = 0;
        let description = '';
        
        // Check for combinations
        if (countValues[0] === 5) {
            tip = 50;
            description = 'Five of a Kind! 🎉';
        } else if (countValues[0] === 4) {
            tip = 40;
            description = 'Four of a Kind! 🎰';
        } else if (countValues[0] === 3 && countValues[1] === 2) {
            tip = 100;
            description = 'Full House! 🏠';
        } else if (countValues[0] === 3) {
            tip = 30;
            description = 'Three of a Kind! 🎲';
        } else if (countValues[0] === 2 && countValues[1] === 2) {
            tip = 10;
            description = 'Two Pair! 👯';
        } else if (countValues[0] === 2) {
            tip = 10;
            description = 'One Pair! 🎯';
        } else {
            tip = 5;
            description = 'High Card 📜';
        }
        
        this.tipResult.innerHTML = `
            <div style="font-size: 1.1rem; margin-bottom: 5px;">${description}</div>
            <div style="font-size: 1.3rem; color: #feca57;">💰 ${tip} credits</div>
        `;
        
        return tip;
    }
}