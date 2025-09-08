// Pokemon Gym Battle Simulator - Beginner Trainer System

class PokemonGymBattleGame {
    constructor() {
        // Game state
        this.gameState = 'trainer-setup'; // trainer-setup, dashboard, battle
        this.trainerName = '';
        this.starterPokemon = null;
        this.totalWins = 0;
        this.gymBadges = 0;
        this.currentBattle = null;
        
        // Basic starter Pokemon for beginners
        this.starterPokemonList = [
            'pikachu', 'bulbasaur', 'charmander', 'squirtle', 'machop',
            'geodude', 'psyduck', 'poliwag', 'abra', 'slowpoke',
            'magikarp', 'eevee', 'meowth', 'oddish', 'bellsprout',
            'tentacool', 'ponyta', 'magnemite', 'seel', 'grimer'
        ];
        
        // Practice battle opponents
        this.practiceOpponents = [
            'youngster joey', 'lass sarah', 'bug catcher tim', 'picnicker lisa',
            'hiker mike', 'fisherman bob', 'sailor jack', 'camper alex'
        ];
        
        // Gym leaders with their Pokemon teams
        this.gymLeaders = {
            brock: {
                name: 'Brock',
                badgeLevel: 1,
                pokemon: ['onix', 'geodude'],
                badge: 'Boulder Badge'
            },
            misty: {
                name: 'Misty',
                badgeLevel: 1,
                pokemon: ['staryu', 'starmie'],
                badge: 'Cascade Badge'
            },
            surge: {
                name: 'Lt. Surge',
                badgeLevel: 5,
                pokemon: ['voltorb', 'pikachu', 'raichu'],
                badge: 'Thunder Badge'
            },
            erika: {
                name: 'Erika',
                badgeLevel: 5,
                pokemon: ['victreebel', 'tangela', 'vileplume'],
                badge: 'Rainbow Badge'
            },
            sabrina: {
                name: 'Sabrina',
                badgeLevel: 10,
                pokemon: ['kadabra', 'mr-mime', 'venomoth', 'alakazam'],
                badge: 'Marsh Badge'
            },
            blaine: {
                name: 'Blaine',
                badgeLevel: 10,
                pokemon: ['growlithe', 'ponyta', 'rapidash', 'arcanine'],
                badge: 'Volcano Badge'
            }
        };
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.populateStarterDropdown();
        this.initializeEventListeners();
        this.loadGameData();
    }
    
    populateStarterDropdown() {
        const select = document.getElementById('starter-pokemon');
        const sortedPokemon = [...this.starterPokemonList].sort();
        
        select.innerHTML = '<option value="">Select your Pokemon...</option>';
        
        sortedPokemon.forEach(pokemon => {
            const option = document.createElement('option');
            option.value = pokemon;
            option.textContent = this.capitalize(pokemon);
            select.appendChild(option);
        });
    }
    
    initializeEventListeners() {
        // Trainer setup
        document.getElementById('trainer-name').addEventListener('input', () => {
            this.checkSetupComplete();
        });
        
        document.getElementById('starter-pokemon').addEventListener('change', () => {
            this.checkSetupComplete();
        });
        
        document.getElementById('start-journey-btn').addEventListener('click', () => {
            this.startJourney();
        });
        
        // Dashboard battles
        document.getElementById('practice-battle-btn').addEventListener('click', () => {
            this.startPracticeBattle();
        });
        
        document.getElementById('gym-challenge-btn').addEventListener('click', () => {
            this.startGymChallenge();
        });
        
        // Battle controls
        document.getElementById('attack-btn').addEventListener('click', () => {
            this.playerAttack();
        });
        
        document.getElementById('back-to-dashboard-btn').addEventListener('click', () => {
            this.backToDashboard();
        });
        
        // Victory modal
        document.getElementById('continue-btn').addEventListener('click', () => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('victory-modal'));
            modal.hide();
            this.backToDashboard();
        });
    }
    
    checkSetupComplete() {
        const trainerName = document.getElementById('trainer-name').value.trim();
        const starterPokemon = document.getElementById('starter-pokemon').value;
        const startBtn = document.getElementById('start-journey-btn');
        
        if (trainerName && starterPokemon) {
            startBtn.disabled = false;
        } else {
            startBtn.disabled = true;
        }
    }
    
    async startJourney() {
        const trainerName = document.getElementById('trainer-name').value.trim();
        const starterPokemonName = document.getElementById('starter-pokemon').value;
        
        this.showLoading(true);
        
        try {
            // Fetch starter Pokemon data
            this.starterPokemon = await this.fetchPokemon(starterPokemonName);
            this.trainerName = trainerName;
            
            // Save game data
            this.saveGameData();
            
            // Show dashboard
            this.showDashboard();
            
        } catch (error) {
            this.showError('Failed to load Pokemon data. Please try again.');
            this.showLoading(false);
        }
    }
    
    showDashboard() {
        this.showLoading(false);
        document.getElementById('trainer-setup-section').classList.add('d-none');
        document.getElementById('trainer-dashboard').classList.remove('d-none');
        
        // Update dashboard
        this.updateDashboard();
        this.gameState = 'dashboard';
    }
    
    updateDashboard() {
        document.getElementById('trainer-name-display').textContent = this.trainerName;
        document.getElementById('total-wins').textContent = this.totalWins;
        document.getElementById('gym-badges').textContent = this.gymBadges;
        document.getElementById('current-pokemon-name').textContent = this.capitalize(this.starterPokemon.name);
        
        // Update gym challenge availability
        const winsNeeded = this.getWinsNeededForNextGym();
        const gymBtn = document.getElementById('gym-challenge-btn');
        const winsRequiredSpan = document.getElementById('wins-required');
        
        if (winsNeeded <= this.totalWins) {
            gymBtn.disabled = false;
            winsRequiredSpan.textContent = 'Ready!';
            winsRequiredSpan.className = 'text-success fw-bold';
        } else {
            gymBtn.disabled = true;
            winsRequiredSpan.textContent = `${winsNeeded} wins needed`;
            winsRequiredSpan.className = 'text-muted';
        }
    }
    
    getWinsNeededForNextGym() {
        if (this.gymBadges === 0) return 15; // First gym requires 15 wins
        if (this.gymBadges < 2) return 15;   // Basic level gyms (1-2 badges)
        if (this.gymBadges < 4) return 30;   // Mid level gyms (3-4 badges) 
        return 50; // Final level gyms (5+ badges)
    }
    
    async startPracticeBattle() {
        this.showLoading(true);
        
        try {
            // Select random practice opponent
            const opponentName = this.practiceOpponents[Math.floor(Math.random() * this.practiceOpponents.length)];
            const opponentPokemonName = this.starterPokemonList[Math.floor(Math.random() * this.starterPokemonList.length)];
            const opponentPokemon = await this.fetchPokemon(opponentPokemonName);
            
            // Setup battle
            this.currentBattle = {
                type: 'practice',
                opponent: opponentName,
                opponentBadgeLevel: 'Beginner',
                playerPokemon: { ...this.starterPokemon },
                opponentPokemon: opponentPokemon,
                currentTurn: 'player'
            };
            
            // Reset HP
            this.currentBattle.playerPokemon.currentHP = this.currentBattle.playerPokemon.maxHP;
            this.currentBattle.opponentPokemon.currentHP = this.currentBattle.opponentPokemon.maxHP;
            
            this.showBattleArena();
            
        } catch (error) {
            this.showError('Failed to start practice battle. Please try again.');
            this.showLoading(false);
        }
    }
    
    async startGymChallenge() {
        this.showLoading(true);
        
        try {
            // Get appropriate gym leader based on current badges
            const gymLeader = this.getNextGymLeader();
            const opponentPokemonName = gymLeader.pokemon[Math.floor(Math.random() * gymLeader.pokemon.length)];
            const opponentPokemon = await this.fetchPokemon(opponentPokemonName);
            
            // Setup gym battle
            this.currentBattle = {
                type: 'gym',
                opponent: gymLeader.name,
                opponentBadgeLevel: `${gymLeader.badgeLevel} Star Badge`,
                badge: gymLeader.badge,
                playerPokemon: { ...this.starterPokemon },
                opponentPokemon: opponentPokemon,
                currentTurn: 'player'
            };
            
            // Reset HP
            this.currentBattle.playerPokemon.currentHP = this.currentBattle.playerPokemon.maxHP;
            this.currentBattle.opponentPokemon.currentHP = this.currentBattle.opponentPokemon.maxHP;
            
            this.showBattleArena();
            
        } catch (error) {
            this.showError('Failed to start gym challenge. Please try again.');
            this.showLoading(false);
        }
    }
    
    getNextGymLeader() {
        const gymLeaderKeys = Object.keys(this.gymLeaders);
        
        // Return gym leader based on current badge count
        if (this.gymBadges === 0) return this.gymLeaders.brock;
        if (this.gymBadges === 1) return this.gymLeaders.misty;
        if (this.gymBadges === 2) return this.gymLeaders.surge;
        if (this.gymBadges === 3) return this.gymLeaders.erika;
        if (this.gymBadges === 4) return this.gymLeaders.sabrina;
        return this.gymLeaders.blaine; // Final gym leader
    }
    
    showBattleArena() {
        this.showLoading(false);
        document.getElementById('trainer-dashboard').classList.add('d-none');
        document.getElementById('battle-arena').classList.remove('d-none');
        
        // Update battle info
        document.getElementById('battle-type').textContent = this.currentBattle.type === 'gym' ? 'Gym Challenge' : 'Practice Battle';
        document.getElementById('opponent-name').textContent = this.currentBattle.opponent;
        document.getElementById('opponent-badge-level').textContent = this.currentBattle.opponentBadgeLevel;
        document.getElementById('battle-trainer-name').textContent = this.trainerName;
        document.getElementById('battle-opponent-name').textContent = this.currentBattle.opponent;
        
        // Display Pokemon
        this.displayBattlePokemon(this.currentBattle.playerPokemon, 'player');
        this.displayBattlePokemon(this.currentBattle.opponentPokemon, 'opponent');
        
        // Clear battle log and add initial entry
        document.getElementById('battle-log').innerHTML = '';
        this.addLogEntry(`Battle begins! ${this.capitalize(this.currentBattle.playerPokemon.name)} vs ${this.capitalize(this.currentBattle.opponentPokemon.name)}!`, 'system');
        
        // Enable attack button
        document.getElementById('attack-btn').disabled = false;
        this.gameState = 'battle';
    }
    
    async fetchPokemon(pokemonName) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            
            if (!response.ok) {
                throw new Error(`Pokemon "${pokemonName}" not found!`);
            }
            
            const data = await response.json();
            
            const pokemon = {
                name: data.name,
                image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
                stats: {
                    hp: data.stats.find(stat => stat.stat.name === 'hp').base_stat,
                    attack: data.stats.find(stat => stat.stat.name === 'attack').base_stat,
                    defense: data.stats.find(stat => stat.stat.name === 'defense').base_stat
                }
            };
            
            pokemon.currentHP = pokemon.stats.hp;
            pokemon.maxHP = pokemon.stats.hp;
            
            return pokemon;
            
        } catch (error) {
            throw new Error(`Failed to fetch Pokemon data for ${pokemonName}`);
        }
    }
    
    displayBattlePokemon(pokemon, type) {
        const imageId = type === 'player' ? 'player-image' : 'opponent-image';
        const nameId = type === 'player' ? 'player-name' : 'opponent-pokemon-name';
        const currentHpId = type === 'player' ? 'player-current-hp' : 'opponent-current-hp';
        const maxHpId = type === 'player' ? 'player-max-hp' : 'opponent-max-hp';
        const attackId = type === 'player' ? 'player-attack' : 'opponent-attack';
        const defenseId = type === 'player' ? 'player-defense' : 'opponent-defense';
        
        document.getElementById(imageId).src = pokemon.image;
        document.getElementById(imageId).alt = pokemon.name;
        document.getElementById(nameId).textContent = this.capitalize(pokemon.name);
        document.getElementById(currentHpId).textContent = pokemon.currentHP;
        document.getElementById(maxHpId).textContent = pokemon.maxHP;
        document.getElementById(attackId).textContent = pokemon.stats.attack;
        document.getElementById(defenseId).textContent = pokemon.stats.defense;
        
        this.updateHPBar(pokemon, type);
    }
    
    updateHPBar(pokemon, type) {
        const hpPercentage = (pokemon.currentHP / pokemon.maxHP) * 100;
        const hpBarId = type === 'player' ? 'player-hp-bar' : 'opponent-hp-bar';
        const currentHpId = type === 'player' ? 'player-current-hp' : 'opponent-current-hp';
        const hpBar = document.getElementById(hpBarId);
        
        hpBar.style.width = `${hpPercentage}%`;
        
        hpBar.classList.remove('hp-high', 'hp-medium', 'hp-low');
        if (hpPercentage > 60) {
            hpBar.classList.add('hp-high');
        } else if (hpPercentage > 30) {
            hpBar.classList.add('hp-medium');
        } else {
            hpBar.classList.add('hp-low');
        }
        
        document.getElementById(currentHpId).textContent = pokemon.currentHP;
    }
    
    playerAttack() {
        if (this.gameState !== 'battle' || this.currentBattle.currentTurn !== 'player') {
            return;
        }
        
        document.getElementById('attack-btn').disabled = true;
        
        // Add attack animation
        document.getElementById('player-image').classList.add('attacking');
        setTimeout(() => {
            document.getElementById('player-image').classList.remove('attacking');
        }, 500);
        
        // Calculate damage
        const damage = this.calculateDamage(this.currentBattle.playerPokemon, this.currentBattle.opponentPokemon);
        this.currentBattle.opponentPokemon.currentHP = Math.max(0, this.currentBattle.opponentPokemon.currentHP - damage);
        
        // Update display
        this.updateHPBar(this.currentBattle.opponentPokemon, 'opponent');
        
        // Add to battle log
        this.addLogEntry(
            `${this.capitalize(this.currentBattle.playerPokemon.name)} attacks for ${damage} damage!`,
            'player-turn'
        );
        
        // Check if opponent Pokemon is defeated
        if (this.currentBattle.opponentPokemon.currentHP <= 0) {
            this.endBattle('player');
            return;
        }
        
        // Switch to opponent turn
        this.currentBattle.currentTurn = 'opponent';
        setTimeout(() => {
            this.opponentAttack();
        }, 1500);
    }
    
    opponentAttack() {
        if (this.gameState !== 'battle' || this.currentBattle.currentTurn !== 'opponent') {
            return;
        }
        
        // Add attack animation
        document.getElementById('opponent-image').classList.add('attacking');
        setTimeout(() => {
            document.getElementById('opponent-image').classList.remove('attacking');
        }, 500);
        
        // Calculate damage
        const damage = this.calculateDamage(this.currentBattle.opponentPokemon, this.currentBattle.playerPokemon);
        this.currentBattle.playerPokemon.currentHP = Math.max(0, this.currentBattle.playerPokemon.currentHP - damage);
        
        // Update display
        this.updateHPBar(this.currentBattle.playerPokemon, 'player');
        
        // Add to battle log
        this.addLogEntry(
            `${this.capitalize(this.currentBattle.opponentPokemon.name)} attacks for ${damage} damage!`,
            'computer-turn'
        );
        
        // Check if player Pokemon is defeated
        if (this.currentBattle.playerPokemon.currentHP <= 0) {
            this.endBattle('opponent');
            return;
        }
        
        // Switch back to player turn
        this.currentBattle.currentTurn = 'player';
        document.getElementById('attack-btn').disabled = false;
    }
    
    calculateDamage(attacker, defender) {
        const baseDamage = attacker.stats.attack - Math.floor(defender.stats.defense / 2);
        const damage = Math.max(1, baseDamage);
        const randomMultiplier = 0.8 + (Math.random() * 0.4);
        return Math.floor(damage * randomMultiplier);
    }
    
    endBattle(winner) {
        document.getElementById('attack-btn').disabled = true;
        
        if (winner === 'player') {
            this.totalWins++;
            
            if (this.currentBattle.type === 'gym') {
                this.gymBadges++;
                this.addLogEntry(`🏆 Victory! You earned the ${this.currentBattle.badge}!`, 'victory');
            } else {
                this.addLogEntry(`🎉 Victory! You gained valuable experience!`, 'victory');
            }
            
            this.saveGameData();
            
            // Show victory modal
            setTimeout(() => {
                this.showVictoryModal();
            }, 1000);
            
        } else {
            this.addLogEntry(`💔 Defeat! ${this.currentBattle.opponent} wins this battle!`, 'defeat');
            
            // Show defeat modal
            setTimeout(() => {
                this.showDefeatModal();
            }, 1000);
        }
    }
    
    showVictoryModal() {
        const modal = new bootstrap.Modal(document.getElementById('victory-modal'));
        const title = document.getElementById('victory-title');
        const content = document.getElementById('victory-content');
        
        if (this.currentBattle.type === 'gym') {
            title.innerHTML = '<i class="fas fa-trophy text-warning"></i> Gym Badge Earned!';
            content.innerHTML = `
                <h5>Congratulations, ${this.trainerName}!</h5>
                <p>You defeated ${this.currentBattle.opponent} and earned the <strong>${this.currentBattle.badge}</strong>!</p>
                <div class="mt-3">
                    <p><i class="fas fa-medal text-warning"></i> Gym Badges: ${this.gymBadges}</p>
                    <p><i class="fas fa-trophy text-success"></i> Total Wins: ${this.totalWins}</p>
                </div>
            `;
        } else {
            title.innerHTML = '<i class="fas fa-star text-success"></i> Victory!';
            content.innerHTML = `
                <h5>Great job, ${this.trainerName}!</h5>
                <p>You defeated ${this.currentBattle.opponent} in practice battle!</p>
                <div class="mt-3">
                    <p><i class="fas fa-trophy text-success"></i> Total Wins: ${this.totalWins}</p>
                    <p>Keep practicing to unlock gym challenges!</p>
                </div>
            `;
        }
        
        modal.show();
    }
    
    showDefeatModal() {
        const modal = new bootstrap.Modal(document.getElementById('victory-modal'));
        const title = document.getElementById('victory-title');
        const content = document.getElementById('victory-content');
        
        title.innerHTML = '<i class="fas fa-heart-broken text-danger"></i> Defeat';
        content.innerHTML = `
            <h5>Don't give up, ${this.trainerName}!</h5>
            <p>${this.currentBattle.opponent} was stronger this time, but you can try again!</p>
            <div class="mt-3">
                <p>Keep practicing to become a better trainer!</p>
            </div>
        `;
        
        modal.show();
    }
    
    backToDashboard() {
        document.getElementById('battle-arena').classList.add('d-none');
        document.getElementById('trainer-dashboard').classList.remove('d-none');
        
        this.updateDashboard();
        this.currentBattle = null;
        this.gameState = 'dashboard';
    }
    
    addLogEntry(message, type = '') {
        const battleLog = document.getElementById('battle-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        
        battleLog.appendChild(entry);
        battleLog.scrollTop = battleLog.scrollHeight;
    }
    
    saveGameData() {
        const gameData = {
            trainerName: this.trainerName,
            starterPokemon: this.starterPokemon,
            totalWins: this.totalWins,
            gymBadges: this.gymBadges
        };
        
        localStorage.setItem('pokemonGymBattleGame', JSON.stringify(gameData));
    }
    
    loadGameData() {
        const savedData = localStorage.getItem('pokemonGymBattleGame');
        
        if (savedData) {
            const gameData = JSON.parse(savedData);
            this.trainerName = gameData.trainerName || '';
            this.starterPokemon = gameData.starterPokemon || null;
            this.totalWins = gameData.totalWins || 0;
            this.gymBadges = gameData.gymBadges || 0;
            
            // If we have saved data, go directly to dashboard
            if (this.trainerName && this.starterPokemon) {
                this.showDashboard();
            }
        }
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
    new PokemonGymBattleGame();
});