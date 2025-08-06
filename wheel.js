export class WheelManager {
    constructor() {
        this.wheel = document.getElementById('wheel');
        this.isSpinning = false;
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
    }
    
    async spin(users) {
        if (this.isSpinning || users.length === 0) return null;
        
        this.isSpinning = true;
        
        // Random rotation between 720-1440 degrees (2-4 full rotations)
        const minRotation = 720;
        const maxRotation = 1440;
        const rotation = Math.random() * (maxRotation - minRotation) + minRotation;
        
        this.wheel.style.transform = `rotate(${rotation}deg)`;
        
        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Calculate which segment was selected
        const normalizedRotation = rotation % 360;
        const segmentAngle = 360 / users.length;
        const selectedIndex = Math.floor(((360 - normalizedRotation) + (segmentAngle / 2)) % 360 / segmentAngle) % users.length;
        
        this.isSpinning = false;
        
        return users[selectedIndex];
    }
}