document.addEventListener('DOMContentLoaded', () => {
    const box = document.getElementById('box');
    const gameArea = document.getElementById('game-area');
    const attemptsDisplay = document.getElementById('attempts');
    
    let attempts = 0;
    
    // Function to get random position within game area
    function getRandomPosition() {
        const boxSize = 60; // Size of the box in pixels
        
        // Calculate maximum positions to keep box fully inside game area
        const maxX = gameArea.clientWidth - boxSize;
        const maxY = gameArea.clientHeight - boxSize;
        
        const x = Math.floor(Math.random() * maxX);
        const y = Math.floor(Math.random() * maxY);
        
        return { x, y };
    }
    
    // Function to move box to a random position
    function moveBox() {
        const pos = getRandomPosition();
        box.style.left = pos.x + 'px';
        box.style.top = pos.y + 'px';
    }
    
    // Initialize box position
    moveBox();
    
    // Move box when mouse enters it (hovers over it)
    box.addEventListener('mouseenter', () => {
        attempts++;
        attemptsDisplay.textContent = attempts;
        moveBox();
    });
    
    // Handle click event (if user manages to click before it moves)
    box.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Wow! You actually caught me! 🎉');
        // Reset the game
        attempts = 0;
        attemptsDisplay.textContent = attempts;
        moveBox();
    });
});
