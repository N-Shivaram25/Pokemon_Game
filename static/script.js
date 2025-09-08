// Pokemon Battle Simulator - Game Logic

class PokemonBattleGame {
    constructor() {
        this.playerPokemon = null;
        this.computerPokemon = null;
        this.gameState = 'setup'; // setup, battle, finished
        this.currentTurn = 'player';
        this.battleLog = [];
        
        // Available Pokemon list for player selection
        this.availablePokemonList = [
            'pikachu', 'charizard', 'blastoise', 'venusaur', 'alakazam', 'machamp',
            'gengar', 'dragonite', 'mewtwo', 'mew', 'typhlosion',
            'feraligatr', 'meganium', 'lugia', 'ho-oh', 'celebi',
            'blaziken', 'swampert', 'sceptile', 'rayquaza', 'garchomp',
            'lucario', 'dialga', 'palkia', 'giratina', 'arceus',
            'squirtle', 'bulbasaur', 'charmander', 'eevee', 'snorlax',
            'lapras', 'gyarados', 'scyther', 'electabuzz', 'magmar',
            'jolteon', 'vaporeon', 'flareon', 'espeon', 'umbreon',
            'leafeon', 'glaceon', 'sylveon', 'lucario', 'riolu',
            'garchomp', 'gible', 'gabite', 'rotom', 'darkrai'
        ];
        
        // Computer Pokemon list for random selection (subset of available)
        this.computerPokemonList = [
            'charizard', 'blastoise', 'venusaur', 'alakazam', 'machamp',
            'gengar', 'dragonite', 'mewtwo', 'mew', 'typhlosion',
            'feraligatr', 'meganium', 'lugia', 'ho-oh', 'celebi',
            'blaziken', 'swampert', 'sceptile', 'rayquaza', 'garchomp',
            'lucario', 'dialga', 'palkia', 'giratina', 'arceus'
        ];
        
        this.initializeEventListeners();
        this.populatePokemonDropdown();
    }
    
    initializeEventListeners() {
        // Start battle button
        document.getElementById('start-battle-btn').addEventListener('click', () => {
            this.startBattle();
        });
        
        // Pokemon selection change
        document.getElementById('pokemon-select').addEventListener('change', (e) => {
            if (e.target.value) {
                // Auto-enable start button when Pokemon is selected
                document.getElementById('start-battle-btn').disabled = false;
            }
        });
        
        // Attack button
        document.getElementById('attack-btn').addEventListener('click', () => {
            this.playerAttack();
        });
        
        // Restart button
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    populatePokemonDropdown() {
        const select = document.getElementById('pokemon-select');
        
        // Sort Pokemon names alphabetically
        const sortedPokemon = [...this.availablePokemonList].sort();
        
        // Add each Pokemon as an option
        sortedPokemon.forEach(pokemon => {
            const option = document.createElement('option');
            option.value = pokemon;
            option.textContent = this.capitalize(pokemon);
            select.appendChild(option);
        });
    }
    
    async startBattle() {
        const playerInput = document.getElementById('pokemon-select').value.trim().toLowerCase();
        
        if (!playerInput) {
            this.showError('Please select a Pokemon!');
            return;
        }
        
        this.showLoading(true);
        this.hideError();
        
        try {
            // Fetch player Pokemon
            this.playerPokemon = await this.fetchPokemon(playerInput);
            
            // Select random computer Pokemon
            const randomIndex = Math.floor(Math.random() * this.computerPokemonList.length);
            const computerPokemonName = this.computerPokemonList[randomIndex];
            this.computerPokemon = await this.fetchPokemon(computerPokemonName);
            
            // Initialize battle
            this.initializeBattle();
            
        } catch (error) {
            this.showError(error.message);
            this.showLoading(false);
        }
    }
    
    async fetchPokemon(pokemonName) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            
            if (!response.ok) {
                throw new Error(`Pokemon "${pokemonName}" not found! Please check the spelling and try again.`);
            }
            
            const data = await response.json();
            
            // Extract relevant stats
            const pokemon = {
                name: data.name,
                image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
                stats: {
                    hp: data.stats.find(stat => stat.stat.name === 'hp').base_stat,
                    attack: data.stats.find(stat => stat.stat.name === 'attack').base_stat,
                    defense: data.stats.find(stat => stat.stat.name === 'defense').base_stat
                }
            };
            
            // Set current HP to max HP
            pokemon.currentHP = pokemon.stats.hp;
            pokemon.maxHP = pokemon.stats.hp;
            
            return pokemon;
            
        } catch (error) {
            if (error.message.includes('not found')) {
                throw error;
            }
            throw new Error('Failed to fetch Pokemon data. Please check your internet connection and try again.');
        }
    }
    
    initializeBattle() {
        this.gameState = 'battle';
        this.currentTurn = 'player';
        this.battleLog = [];
        
        // Hide setup and loading, show battle arena
        this.showLoading(false);
        document.getElementById('setup-section').classList.add('d-none');
        document.getElementById('battle-arena').classList.remove('d-none');
        
        // Display Pokemon
        this.displayPokemon(this.playerPokemon, 'player');
        this.displayPokemon(this.computerPokemon, 'computer');
        
        // Add initial log entry
        this.addLogEntry(`Battle begins! ${this.capitalize(this.playerPokemon.name)} vs ${this.capitalize(this.computerPokemon.name)}!`, 'system');
        
        // Enable attack button
        document.getElementById('attack-btn').disabled = false;
    }
    
    displayPokemon(pokemon, type) {
        // Update image
        document.getElementById(`${type}-image`).src = pokemon.image;
        document.getElementById(`${type}-image`).alt = pokemon.name;
        
        // Update name
        document.getElementById(`${type}-name`).textContent = this.capitalize(pokemon.name);
        
        // Update stats
        document.getElementById(`${type}-current-hp`).textContent = pokemon.currentHP;
        document.getElementById(`${type}-max-hp`).textContent = pokemon.maxHP;
        document.getElementById(`${type}-attack`).textContent = pokemon.stats.attack;
        document.getElementById(`${type}-defense`).textContent = pokemon.stats.defense;
        
        // Update HP bar
        this.updateHPBar(pokemon, type);
    }
    
    updateHPBar(pokemon, type) {
        const hpPercentage = (pokemon.currentHP / pokemon.maxHP) * 100;
        const hpBar = document.getElementById(`${type}-hp-bar`);
        
        hpBar.style.width = `${hpPercentage}%`;
        
        // Change color based on HP percentage
        hpBar.classList.remove('hp-high', 'hp-medium', 'hp-low');
        if (hpPercentage > 60) {
            hpBar.classList.add('hp-high');
        } else if (hpPercentage > 30) {
            hpBar.classList.add('hp-medium');
        } else {
            hpBar.classList.add('hp-low');
        }
        
        // Update current HP display
        document.getElementById(`${type}-current-hp`).textContent = pokemon.currentHP;
    }
    
    playerAttack() {
        if (this.gameState !== 'battle' || this.currentTurn !== 'player') {
            return;
        }
        
        // Disable attack button during turn processing
        document.getElementById('attack-btn').disabled = true;
        
        // Add attack animation
        document.getElementById('player-image').classList.add('attacking');
        setTimeout(() => {
            document.getElementById('player-image').classList.remove('attacking');
        }, 500);
        
        // Calculate damage
        const damage = this.calculateDamage(this.playerPokemon, this.computerPokemon);
        this.computerPokemon.currentHP = Math.max(0, this.computerPokemon.currentHP - damage);
        
        // Update display
        this.updateHPBar(this.computerPokemon, 'computer');
        
        // Add to battle log
        this.addLogEntry(
            `${this.capitalize(this.playerPokemon.name)} attacks ${this.capitalize(this.computerPokemon.name)} for ${damage} damage!`,
            'player-turn'
        );
        
        // Check if computer Pokemon is defeated
        if (this.computerPokemon.currentHP <= 0) {
            this.endBattle('player');
            return;
        }
        
        // Switch to computer turn
        this.currentTurn = 'computer';
        setTimeout(() => {
            this.computerAttack();
        }, 1500);
    }
    
    computerAttack() {
        if (this.gameState !== 'battle' || this.currentTurn !== 'computer') {
            return;
        }
        
        // Add attack animation
        document.getElementById('computer-image').classList.add('attacking');
        setTimeout(() => {
            document.getElementById('computer-image').classList.remove('attacking');
        }, 500);
        
        // Calculate damage
        const damage = this.calculateDamage(this.computerPokemon, this.playerPokemon);
        this.playerPokemon.currentHP = Math.max(0, this.playerPokemon.currentHP - damage);
        
        // Update display
        this.updateHPBar(this.playerPokemon, 'player');
        
        // Add to battle log
        this.addLogEntry(
            `${this.capitalize(this.computerPokemon.name)} attacks ${this.capitalize(this.playerPokemon.name)} for ${damage} damage!`,
            'computer-turn'
        );
        
        // Check if player Pokemon is defeated
        if (this.playerPokemon.currentHP <= 0) {
            this.endBattle('computer');
            return;
        }
        
        // Switch back to player turn
        this.currentTurn = 'player';
        document.getElementById('attack-btn').disabled = false;
    }
    
    calculateDamage(attacker, defender) {
        // Damage calculation: Attack - (Defense / 2), minimum 1 damage
        const baseDamage = attacker.stats.attack - Math.floor(defender.stats.defense / 2);
        const damage = Math.max(1, baseDamage);
        
        // Add some randomness (±20%)
        const randomMultiplier = 0.8 + (Math.random() * 0.4);
        return Math.floor(damage * randomMultiplier);
    }
    
    endBattle(winner) {
        this.gameState = 'finished';
        document.getElementById('attack-btn').disabled = true;
        
        let winnerName, winnerPokemon;
        if (winner === 'player') {
            winnerName = 'You';
            winnerPokemon = this.playerPokemon;
            this.addLogEntry(`${this.capitalize(this.playerPokemon.name)} wins the battle!`, 'victory');
        } else {
            winnerName = 'Computer';
            winnerPokemon = this.computerPokemon;
            this.addLogEntry(`${this.capitalize(this.computerPokemon.name)} wins the battle!`, 'victory');
        }
        
        // Show victory modal
        setTimeout(() => {
            this.showVictoryModal(winner, winnerName, winnerPokemon);
        }, 1000);
    }
    
    showVictoryModal(winner, winnerName, winnerPokemon) {
        const modal = new bootstrap.Modal(document.getElementById('victory-modal'));
        const title = document.getElementById('victory-title');
        const content = document.getElementById('victory-content');
        
        if (winner === 'player') {
            title.innerHTML = '<i class="fas fa-trophy text-warning"></i> Victory!';
            content.innerHTML = `
                <h5>Congratulations!</h5>
                <p>Your ${this.capitalize(winnerPokemon.name)} has won the battle!</p>
                <div class="mt-3">
                    <img src="${winnerPokemon.image}" alt="${winnerPokemon.name}" style="width: 100px; height: 100px;">
                </div>
            `;
        } else {
            title.innerHTML = '<i class="fas fa-skull text-danger"></i> Defeat!';
            content.innerHTML = `
                <h5>Better luck next time!</h5>
                <p>The computer's ${this.capitalize(winnerPokemon.name)} has won the battle!</p>
                <div class="mt-3">
                    <img src="${winnerPokemon.image}" alt="${winnerPokemon.name}" style="width: 100px; height: 100px;">
                </div>
            `;
        }
        
        modal.show();
    }
    
    addLogEntry(message, type = '') {
        const battleLog = document.getElementById('battle-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        
        battleLog.appendChild(entry);
        battleLog.scrollTop = battleLog.scrollHeight;
    }
    
    restartGame() {
        // Reset game state
        this.gameState = 'setup';
        this.playerPokemon = null;
        this.computerPokemon = null;
        this.currentTurn = 'player';
        this.battleLog = [];
        
        // Reset UI
        document.getElementById('pokemon-select').value = '';
        document.getElementById('setup-section').classList.remove('d-none');
        document.getElementById('battle-arena').classList.add('d-none');
        document.getElementById('battle-log').innerHTML = '';
        this.hideError();
        this.showLoading(false);
        
        // Focus on select
        document.getElementById('pokemon-select').focus();
    }
    
    showLoading(show) {
        const loadingSection = document.getElementById('loading-section');
        if (show) {
            loadingSection.classList.remove('d-none');
        } else {
            loadingSection.classList.add('d-none');
        }
    }
    
    showError(message) {
        const errorDiv = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        
        errorText.textContent = message;
        errorDiv.classList.remove('d-none');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }
    
    hideError() {
        document.getElementById('error-message').classList.add('d-none');
    }
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PokemonBattleGame();
});
