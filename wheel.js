export class WheelManager {
    constructor() {
        this.wheel = document.getElementById('wheel');
        this.hoveredUserContainer = document.getElementById('hoveredUser');
        this.hoveredUserPfp = document.getElementById('hoveredUserPfp');
        this.isSpinning = false;
        this.currentRotation = 0;
    }
    
    createWheel(users) {
        this.wheel.innerHTML = '';
        
        const segmentAngle = 360 / users.length;
        
        users.forEach((user, index) => {
            const segment = document.createElement('div');
            segment.className = 'wheel-segment';
            
            const rotation = segmentAngle * index;
            segment.style.transform = `rotate(${rotation}deg)`;
            segment.style.clipPath = `polygon(50% 50%, 50% 0%, ${50 + Math.tan((segmentAngle * Math.PI) / 360) * 50}% 0%)`;
            
            // Create alternating colors
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
            segment.style.background = colors[index % colors.length];
            
            const img = document.createElement('img');
            img.src = user.avatar_url || `https://images.websim.com/avatar/${user.username}`;
            img.alt = user.username;
            img.title = `@${user.username}`;
            
            segment.appendChild(img);
            this.wheel.appendChild(segment);
        });

        const transform = window.getComputedStyle(this.wheel).getPropertyValue('transform');
        if (transform && transform !== 'none') {
            const matrix = new DOMMatrix(transform);
            this.currentRotation = Math.round(Math.atan2(matrix.b, matrix.a) * (180 / Math.PI));
        } else {
            this.currentRotation = 0;
        }
    }

    updateHoveredUser(users, rotation) {
        if (!users || users.length === 0) {
            this.hoveredUserContainer.style.display = 'none';
            return;
        }

        const segmentAngle = 360 / users.length;
        const normalizedRotation = rotation % 360;
        const selectedIndex = Math.floor(((360 - normalizedRotation) + (segmentAngle / 2)) % 360 / segmentAngle) % users.length;
        
        const user = users[selectedIndex];
        
        if (user && this.hoveredUserPfp.alt !== user.username) {
            this.hoveredUserPfp.src = user.avatar_url || `https://images.websim.com/avatar/${user.username}`;
            this.hoveredUserPfp.alt = user.username;
        }
    }
    
    async spin(users) {
        if (this.isSpinning || users.length === 0) return null;
        
        this.isSpinning = true;
        this.hoveredUserContainer.style.display = 'block';
        
        const startRotation = this.currentRotation;
        const minRotations = 4;
        const maxRotations = 6;
        const randomExtraRotation = Math.random() * (maxRotations - minRotations) * 360;
        const endRotation = startRotation + (minRotations * 360) + randomExtraRotation;
        
        const duration = 4000;
        let startTime = null;

        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

        return new Promise(resolve => {
            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                
                const elapsedTime = timestamp - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                const easedProgress = easeOutCubic(progress);

                const newRotation = startRotation + (endRotation - startRotation) * easedProgress;
                this.currentRotation = newRotation;
                
                this.wheel.style.transform = `rotate(${newRotation}deg)`;
                this.updateHoveredUser(users, newRotation);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.isSpinning = false;
                    this.hoveredUserContainer.style.display = 'none';
                    
                    const segmentAngle = 360 / users.length;
                    const normalizedRotation = this.currentRotation % 360;
                    const selectedIndex = Math.floor(((360 - normalizedRotation) + (segmentAngle / 2)) % 360 / segmentAngle) % users.length;
                    
                    resolve(users[selectedIndex]);
                }
            };
            
            requestAnimationFrame(animate);
        });
    }
}