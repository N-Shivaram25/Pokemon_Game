// Pokemon Tournament Battle Simulator - Game Logic

class PokemonTournamentGame {
    constructor() {
        // Game state
        this.gameState = 'trainer-setup'; // trainer-setup, team-selection, tournament, battle, finished
        this.playerTrainer = null;
        this.opponentTrainer = null;
        this.playerTeam = [];
        this.opponentTeam = [];
        this.currentRound = 0;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.roundResults = [];
        this.currentBattle = null;
        
        // Available Pokemon list
        this.availablePokemonList = [
            'pikachu', 'charizard', 'blastoise', 'venusaur', 'alakazam', 'machamp',
            'gengar', 'dragonite', 'mewtwo', 'mew', 'typhlosion', 'feraligatr', 
            'meganium', 'lugia', 'ho-oh', 'celebi', 'blaziken', 'swampert', 
            'sceptile', 'rayquaza', 'garchomp', 'lucario', 'dialga', 'palkia', 
            'giratina', 'arceus', 'squirtle', 'bulbasaur', 'charmander', 'eevee', 
            'snorlax', 'lapras', 'gyarados', 'scyther', 'electabuzz', 'magmar',
            'jolteon', 'vaporeon', 'flareon', 'espeon', 'umbreon', 'leafeon', 
            'glaceon', 'sylveon', 'riolu', 'gible', 'gabite', 'rotom', 'darkrai'
        ];
        
        // Opponent trainer teams
        this.opponentTeams = {
            ash: ['pikachu', 'charizard', 'snorlax', 'lapras'],
            gary: ['blastoise', 'alakazam', 'machamp', 'gengar'],
            misty: ['gyarados', 'vaporeon', 'lapras', 'blastoise'],
            brock: ['onix', 'graveler', 'machamp', 'crobat'],
            lance: ['dragonite', 'charizard', 'gyarados', 'aerodactyl'],
            cynthia: ['garchomp', 'lucario', 'dialga', 'rayquaza']
        };
        
        this.opponentNames = {
            ash: 'Ash Ketchum',
            gary: 'Gary Oak',
            misty: 'Misty',
            brock: 'Brock',
            lance: 'Lance',
            cynthia: 'Cynthia'
        };
        
        this.initializeEventListeners();
        this.populateTeamSelectionDropdowns();
    }
    
    initializeEventListeners() {
        // Trainer setup
        document.getElementById('trainer-name').addEventListener('input', () => {
            this.checkTrainerSetupComplete();
        });
        
        document.getElementById('opponent-select').addEventListener('change', () => {
            this.checkTrainerSetupComplete();
        });
        
        document.getElementById('continue-to-team-btn').addEventListener('click', () => {
            this.setupTrainerProfiles();
        });
        
        // Team selection
        document.querySelectorAll('.pokemon-team-select').forEach(select => {
            select.addEventListener('change', (e) => {
                this.updatePlayerTeam(e.target);
            });
        });
        
        document.getElementById('start-tournament-btn').addEventListener('click', () => {
            this.startTournament();
        });
        
        // Battle controls
        document.getElementById('attack-btn').addEventListener('click', () => {
            this.playerAttack();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    populateTeamSelectionDropdowns() {
        const selects = document.querySelectorAll('.pokemon-team-select');
        const sortedPokemon = [...this.availablePokemonList].sort();
        
        selects.forEach(select => {
            // Clear existing options except the first one
            select.innerHTML = '<option value="">Choose Pokemon...</option>';
            
            sortedPokemon.forEach(pokemon => {
                const option = document.createElement('option');
                option.value = pokemon;
                option.textContent = this.capitalize(pokemon);
                select.appendChild(option);
            });
        });
    }
    
    checkTrainerSetupComplete() {
        const trainerName = document.getElementById('trainer-name').value.trim();
        const opponentSelect = document.getElementById('opponent-select').value;
        const continueBtn = document.getElementById('continue-to-team-btn');
        
        if (trainerName && opponentSelect) {
            continueBtn.disabled = false;
        } else {
            continueBtn.disabled = true;
        }
    }
    
    setupTrainerProfiles() {
        const trainerName = document.getElementById('trainer-name').value.trim();
        const opponentKey = document.getElementById('opponent-select').value;
        
        this.playerTrainer = trainerName;
        this.opponentTrainer = this.opponentNames[opponentKey];
        
        // Update UI
        document.getElementById('player-trainer-name').textContent = trainerName;
        document.getElementById('opponent-trainer-name').textContent = this.opponentTrainer;
        
        // Setup opponent team
        this.opponentTeam = [...this.opponentTeams[opponentKey]];
        this.displayOpponentTeam();
        
        // Show team selection
        document.getElementById('trainer-setup-section').classList.add('d-none');
        document.getElementById('team-selection-section').classList.remove('d-none');
        
        this.gameState = 'team-selection';
    }
    
    async displayOpponentTeam() {
        const display = document.getElementById('opponent-team-display');
        display.innerHTML = '<p class="text-center">Loading opponent team...</p>';
        
        try {
            const teamHTML = await Promise.all(
                this.opponentTeam.map(async (pokemonName) => {
                    try {
                        const pokemon = await this.fetchPokemonBasicInfo(pokemonName);
                        return `
                            <div class="team-pokemon-item">
                                <img src="${pokemon.image}" alt="${pokemon.name}">
                                <div class="pokemon-name">${this.capitalize(pokemon.name)}</div>
                            </div>
                        `;
                    } catch (error) {
                        return `
                            <div class="team-pokemon-item">
                                <div class="pokemon-name">${this.capitalize(pokemonName)}</div>
                                <small class="text-muted">Image unavailable</small>
                            </div>
                        `;
                    }
                })
            );
            
            display.innerHTML = teamHTML.join('');
        } catch (error) {
            display.innerHTML = '<p class="text-danger">Error loading opponent team</p>';
        }
    }
    
    async updatePlayerTeam(selectElement) {
        const slot = parseInt(selectElement.dataset.slot);
        const pokemonName = selectElement.value;
        
        if (pokemonName) {
            // Check for duplicates
            const currentTeam = this.getPlayerTeamSelections();
            const duplicateIndex = currentTeam.findIndex((name, index) => name === pokemonName && index !== slot);
            
            if (duplicateIndex !== -1) {
                this.showError(`${this.capitalize(pokemonName)} is already in your team!`);
                selectElement.value = '';
                return;
            }
        }
        
        await this.updatePlayerTeamDisplay();
        this.checkTeamSelectionComplete();
    }
    
    getPlayerTeamSelections() {
        const selects = document.querySelectorAll('.pokemon-team-select');
        return Array.from(selects).map(select => select.value);
    }
    
    async updatePlayerTeamDisplay() {
        const display = document.getElementById('player-team-display');
        const selections = this.getPlayerTeamSelections();
        
        const teamHTML = await Promise.all(
            selections.map(async (pokemonName, index) => {
                if (!pokemonName) {
                    return `
                        <div class="team-pokemon-item">
                            <div style="width: 60px; height: 60px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                <i class="fas fa-plus text-muted"></i>
                            </div>
                            <div class="pokemon-name">Slot ${index + 1}</div>
                        </div>
                    `;
                }
                
                try {
                    const pokemon = await this.fetchPokemonBasicInfo(pokemonName);
                    return `
                        <div class="team-pokemon-item">
                            <img src="${pokemon.image}" alt="${pokemon.name}">
                            <div class="pokemon-name">${this.capitalize(pokemon.name)}</div>
                        </div>
                    `;
                } catch (error) {
                    return `
                        <div class="team-pokemon-item">
                            <div class="pokemon-name">${this.capitalize(pokemonName)}</div>
                            <small class="text-muted">Image unavailable</small>
                        </div>
                    `;
                }
            })
        );
        
        display.innerHTML = teamHTML.join('');
    }
    
    checkTeamSelectionComplete() {
        const selections = this.getPlayerTeamSelections();
        const isComplete = selections.every(selection => selection !== '');
        
        document.getElementById('start-tournament-btn').disabled = !isComplete;
    }
    
    async startTournament() {
        this.showLoading(true);
        
        try {
            // Fetch full data for all Pokemon
            const playerSelections = this.getPlayerTeamSelections();
            this.playerTeam = await Promise.all(
                playerSelections.map(name => this.fetchPokemon(name))
            );
            
            this.opponentTeam = await Promise.all(
                this.opponentTeam.map(name => this.fetchPokemon(name))
            );
            
            // Initialize tournament
            this.currentRound = 0;
            this.playerScore = 0;
            this.opponentScore = 0;
            this.roundResults = [];
            
            // Setup UI
            this.setupTournamentUI();
            this.startNextRound();
            
        } catch (error) {
            this.showError('Failed to load Pokemon data. Please try again.');
            this.showLoading(false);
        }
    }
    
    setupTournamentUI() {
        this.showLoading(false);
        document.getElementById('team-selection-section').classList.add('d-none');
        document.getElementById('battle-arena').classList.remove('d-none');
        
        // Update names in battle UI
        document.getElementById('battle-player-name').textContent = this.playerTrainer;
        document.getElementById('battle-opponent-name').textContent = this.opponentTrainer;
        document.getElementById('player-score-name').textContent = this.playerTrainer;
        document.getElementById('opponent-score-name').textContent = this.opponentTrainer;
        
        // Initialize round indicators
        this.updateRoundIndicators();
        
        this.gameState = 'tournament';
    }
    
    startNextRound() {
        if (this.currentRound >= 4) {
            this.endTournament();
            return;
        }
        
        this.currentRound++;
        
        // Select Pokemon for this round
        const playerPokemon = { ...this.playerTeam[this.currentRound - 1] };
        const opponentPokemon = { ...this.opponentTeam[this.currentRound - 1] };
        
        // Reset HP
        playerPokemon.currentHP = playerPokemon.maxHP;
        opponentPokemon.currentHP = opponentPokemon.maxHP;
        
        this.currentBattle = {
            player: playerPokemon,
            opponent: opponentPokemon,
            currentTurn: 'player'
        };
        
        // Update UI
        this.updateTournamentProgress();
        this.displayBattlePokemon(playerPokemon, 'player');
        this.displayBattlePokemon(opponentPokemon, 'computer');
        
        // Add log entry
        this.addLogEntry(`Round ${this.currentRound}: ${this.capitalize(playerPokemon.name)} vs ${this.capitalize(opponentPokemon.name)}!`, 'system');
        
        // Enable attack button
        document.getElementById('attack-btn').disabled = false;
        this.gameState = 'battle';
    }
    
    updateTournamentProgress() {
        document.getElementById('current-round').textContent = this.currentRound;
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('opponent-score').textContent = this.opponentScore;
    }
    
    updateRoundIndicators() {
        const container = document.getElementById('round-results');
        container.innerHTML = '';
        
        for (let i = 0; i < 4; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'round-indicator';
            indicator.textContent = i + 1;
            
            if (i < this.roundResults.length) {
                indicator.classList.add(this.roundResults[i] === 'player' ? 'win' : 'loss');
            } else {
                indicator.classList.add('pending');
            }
            
            container.appendChild(indicator);
        }
    }
    
    async fetchPokemonBasicInfo(pokemonName) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        if (!response.ok) {
            throw new Error(`Pokemon "${pokemonName}" not found!`);
        }
        const data = await response.json();
        
        return {
            name: data.name,
            image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default
        };
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
        document.getElementById(`${type}-image`).src = pokemon.image;
        document.getElementById(`${type}-image`).alt = pokemon.name;
        document.getElementById(`${type}-name`).textContent = this.capitalize(pokemon.name);
        document.getElementById(`${type}-current-hp`).textContent = pokemon.currentHP;
        document.getElementById(`${type}-max-hp`).textContent = pokemon.maxHP;
        document.getElementById(`${type}-attack`).textContent = pokemon.stats.attack;
        document.getElementById(`${type}-defense`).textContent = pokemon.stats.defense;
        
        this.updateHPBar(pokemon, type);
    }
    
    updateHPBar(pokemon, type) {
        const hpPercentage = (pokemon.currentHP / pokemon.maxHP) * 100;
        const hpBar = document.getElementById(`${type}-hp-bar`);
        
        hpBar.style.width = `${hpPercentage}%`;
        
        hpBar.classList.remove('hp-high', 'hp-medium', 'hp-low');
        if (hpPercentage > 60) {
            hpBar.classList.add('hp-high');
        } else if (hpPercentage > 30) {
            hpBar.classList.add('hp-medium');
        } else {
            hpBar.classList.add('hp-low');
        }
        
        document.getElementById(`${type}-current-hp`).textContent = pokemon.currentHP;
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
        const damage = this.calculateDamage(this.currentBattle.player, this.currentBattle.opponent);
        this.currentBattle.opponent.currentHP = Math.max(0, this.currentBattle.opponent.currentHP - damage);
        
        // Update display
        this.updateHPBar(this.currentBattle.opponent, 'computer');
        
        // Add to battle log
        this.addLogEntry(
            `${this.capitalize(this.currentBattle.player.name)} attacks for ${damage} damage!`,
            'player-turn'
        );
        
        // Check if opponent Pokemon is defeated
        if (this.currentBattle.opponent.currentHP <= 0) {
            this.endRound('player');
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
        document.getElementById('computer-image').classList.add('attacking');
        setTimeout(() => {
            document.getElementById('computer-image').classList.remove('attacking');
        }, 500);
        
        // Calculate damage
        const damage = this.calculateDamage(this.currentBattle.opponent, this.currentBattle.player);
        this.currentBattle.player.currentHP = Math.max(0, this.currentBattle.player.currentHP - damage);
        
        // Update display
        this.updateHPBar(this.currentBattle.player, 'player');
        
        // Add to battle log
        this.addLogEntry(
            `${this.capitalize(this.currentBattle.opponent.name)} attacks for ${damage} damage!`,
            'computer-turn'
        );
        
        // Check if player Pokemon is defeated
        if (this.currentBattle.player.currentHP <= 0) {
            this.endRound('opponent');
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
    
    endRound(winner) {
        document.getElementById('attack-btn').disabled = true;
        
        if (winner === 'player') {
            this.playerScore += 100;
            this.roundResults.push('player');
            this.addLogEntry(`${this.playerTrainer} wins Round ${this.currentRound}! (+100 points)`, 'victory');
        } else {
            this.opponentScore += 100;
            this.roundResults.push('opponent');
            this.addLogEntry(`${this.opponentTrainer} wins Round ${this.currentRound}!`, 'victory');
        }
        
        this.updateTournamentProgress();
        this.updateRoundIndicators();
        
        // Continue to next round after delay
        setTimeout(() => {
            this.startNextRound();
        }, 2000);
    }
    
    endTournament() {
        this.gameState = 'finished';
        
        let winner, winnerScore;
        if (this.playerScore > this.opponentScore) {
            winner = this.playerTrainer;
            winnerScore = this.playerScore;
            this.addLogEntry(`🏆 ${this.playerTrainer} wins the tournament! Final Score: ${this.playerScore} - ${this.opponentScore}`, 'victory');
        } else if (this.opponentScore > this.playerScore) {
            winner = this.opponentTrainer;
            winnerScore = this.opponentScore;
            this.addLogEntry(`${this.opponentTrainer} wins the tournament! Final Score: ${this.opponentScore} - ${this.playerScore}`, 'victory');
        } else {
            winner = 'Draw';
            this.addLogEntry(`Tournament ends in a draw! Final Score: ${this.playerScore} - ${this.opponentScore}`, 'victory');
        }
        
        // Show final results modal
        setTimeout(() => {
            this.showTournamentResults(winner, winnerScore);
        }, 1000);
    }
    
    showTournamentResults(winner, score) {
        const modal = new bootstrap.Modal(document.getElementById('victory-modal'));
        const title = document.getElementById('victory-title');
        const content = document.getElementById('victory-content');
        
        if (winner === this.playerTrainer) {
            title.innerHTML = '<i class="fas fa-trophy text-warning"></i> Tournament Victory!';
            content.innerHTML = `
                <h5>Congratulations ${winner}!</h5>
                <p>You won the tournament with a score of ${score}!</p>
                <div class="mt-3">
                    <h6>Final Results:</h6>
                    <p>${this.playerTrainer}: ${this.playerScore} points</p>
                    <p>${this.opponentTrainer}: ${this.opponentScore} points</p>
                </div>
            `;
        } else if (winner === 'Draw') {
            title.innerHTML = '<i class="fas fa-handshake text-info"></i> Tournament Draw!';
            content.innerHTML = `
                <h5>Amazing Tournament!</h5>
                <p>The tournament ended in a draw!</p>
                <div class="mt-3">
                    <h6>Final Results:</h6>
                    <p>${this.playerTrainer}: ${this.playerScore} points</p>
                    <p>${this.opponentTrainer}: ${this.opponentScore} points</p>
                </div>
            `;
        } else {
            title.innerHTML = '<i class="fas fa-medal text-secondary"></i> Tournament Complete!';
            content.innerHTML = `
                <h5>Great effort ${this.playerTrainer}!</h5>
                <p>${winner} won the tournament with ${score} points!</p>
                <div class="mt-3">
                    <h6>Final Results:</h6>
                    <p>${this.playerTrainer}: ${this.playerScore} points</p>
                    <p>${this.opponentTrainer}: ${this.opponentScore} points</p>
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
        // Reset all game state
        this.gameState = 'trainer-setup';
        this.playerTrainer = null;
        this.opponentTrainer = null;
        this.playerTeam = [];
        this.opponentTeam = [];
        this.currentRound = 0;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.roundResults = [];
        this.currentBattle = null;
        
        // Reset UI
        document.getElementById('trainer-name').value = '';
        document.getElementById('opponent-select').value = '';
        document.getElementById('continue-to-team-btn').disabled = true;
        document.getElementById('start-tournament-btn').disabled = true;
        
        // Reset team selections
        document.querySelectorAll('.pokemon-team-select').forEach(select => {
            select.value = '';
        });
        
        // Show initial section
        document.getElementById('trainer-setup-section').classList.remove('d-none');
        document.getElementById('team-selection-section').classList.add('d-none');
        document.getElementById('battle-arena').classList.add('d-none');
        document.getElementById('battle-log').innerHTML = '';
        
        this.hideError();
        this.showLoading(false);
        
        // Focus on trainer name input
        document.getElementById('trainer-name').focus();
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
    new PokemonTournamentGame();
});