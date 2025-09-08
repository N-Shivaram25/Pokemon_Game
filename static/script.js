// Pokemon Gym Battle Simulator - Simplified Beginner System

class PokemonGymBattleGame {
    constructor() {
        // Game state
        this.gameState = 'trainer-setup'; // trainer-setup, pokemon-selection, dashboard, battle
        this.trainerName = '';
        this.pokemonCollection = [];
        this.activePokemon = null;
        this.totalWins = 0;
        this.gymBadges = 0;
        this.currentBattle = null;
        this.winsUntilNextPokemon = 2;
        
        // Basic starter Pokemon for beginners
        this.starterPokemonList = [
            'pikachu', 'bulbasaur', 'charmander', 'squirtle', 'machop',
            'geodude', 'psyduck', 'poliwag', 'abra', 'slowpoke',
            'magikarp', 'eevee', 'meowth', 'oddish', 'bellsprout',
            'tentacool', 'ponyta', 'magnemite', 'seel', 'grimer'
        ];
        
        // Pokemon evolution mapping
        this.evolutionMap = {
            'bulbasaur': 'ivysaur',
            'charmander': 'charmeleon', 
            'squirtle': 'wartortle',
            'pikachu': 'raichu',
            'machop': 'machoke',
            'geodude': 'graveler',
            'psyduck': 'golduck',
            'poliwag': 'poliwhirl',
            'abra': 'kadabra',
            'slowpoke': 'slowbro',
            'magikarp': 'gyarados',
            'eevee': 'vaporeon',
            'meowth': 'persian',
            'oddish': 'gloom',
            'bellsprout': 'weepinbell',
            'tentacool': 'tentacruel',
            'ponyta': 'rapidash',
            'magnemite': 'magneton',
            'seel': 'dewgong',
            'grimer': 'muk'
        };
        
        // Practice battle opponents
        this.practiceOpponents = [
            'youngster joey', 'lass sarah', 'bug catcher tim', 'picnicker lisa',
            'hiker mike', 'fisherman bob', 'sailor jack', 'camper alex'
        ];
        
        // Gym leaders
        this.gymLeaders = {
            brock: {
                name: 'Brock',
                pokemon: ['onix', 'geodude'],
                badge: 'Boulder Badge'
            },
            misty: {
                name: 'Misty',
                pokemon: ['staryu', 'starmie'],
                badge: 'Cascade Badge'
            },
            surge: {
                name: 'Lt. Surge',
                pokemon: ['voltorb', 'pikachu', 'raichu'],
                badge: 'Thunder Badge'
            },
            erika: {
                name: 'Erika',
                pokemon: ['victreebel', 'tangela', 'vileplume'],
                badge: 'Rainbow Badge'
            }
        };
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.loadGameData();
        this.populateStarterDropdown();
        this.initializeEventListeners();
        
        // If we have saved data, show appropriate section
        if (this.trainerName && this.pokemonCollection.length > 0) {
            this.showDashboard();
        } else if (this.trainerName) {
            this.showPokemonSelection();
        }
    }
    
    populateStarterDropdown() {
        const select = document.getElementById('starter-pokemon');
        if (!select) return;
        
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
        // Trainer name setup
        const trainerNameInput = document.getElementById('trainer-name');
        if (trainerNameInput) {
            trainerNameInput.addEventListener('input', () => {
                this.checkTrainerNameComplete();
            });
        }
        
        const startJourneyBtn = document.getElementById('start-journey-btn');
        if (startJourneyBtn) {
            startJourneyBtn.addEventListener('click', () => {
                this.startJourney();
            });
        }
        
        // Pokemon selection
        const starterPokemon = document.getElementById('starter-pokemon');
        if (starterPokemon) {
            starterPokemon.addEventListener('change', () => {
                this.checkPokemonSelectionComplete();
            });
        }
        
        const confirmPokemonBtn = document.getElementById('confirm-pokemon-btn');
        if (confirmPokemonBtn) {
            confirmPokemonBtn.addEventListener('click', () => {
                this.confirmPokemonSelection();
            });
        }
        
        // Dashboard
        const currentPokemonSelect = document.getElementById('current-pokemon-select');
        if (currentPokemonSelect) {
            currentPokemonSelect.addEventListener('change', () => {
                this.changeActivePokemon();
            });
        }
        
        const practiceBattleBtn = document.getElementById('practice-battle-btn');
        if (practiceBattleBtn) {
            practiceBattleBtn.addEventListener('click', () => {
                this.startPracticeBattle();
            });
        }
        
        const gymChallengeBtn = document.getElementById('gym-challenge-btn');
        if (gymChallengeBtn) {
            gymChallengeBtn.addEventListener('click', () => {
                this.startGymChallenge();
            });
        }
        
        // Battle controls
        const attackBtn = document.getElementById('attack-btn');
        if (attackBtn) {
            attackBtn.addEventListener('click', () => {
                this.playerAttack();
            });
        }
        
        const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
        if (backToDashboardBtn) {
            backToDashboardBtn.addEventListener('click', () => {
                this.backToDashboard();
            });
        }
        
        // Victory modal
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('victory-modal'));
                if (modal) modal.hide();
                this.backToDashboard();
            });
        }
    }
    
    checkTrainerNameComplete() {
        const trainerName = document.getElementById('trainer-name').value.trim();
        const startBtn = document.getElementById('start-journey-btn');
        
        if (trainerName) {
            startBtn.disabled = false;
        } else {
            startBtn.disabled = true;
        }
    }
    
    startJourney() {
        const trainerName = document.getElementById('trainer-name').value.trim();
        this.trainerName = trainerName;
        this.saveGameData();
        this.showPokemonSelection();
    }
    
    showPokemonSelection() {
        document.getElementById('trainer-setup-section').classList.add('d-none');
        document.getElementById('pokemon-selection-section').classList.remove('d-none');
        this.gameState = 'pokemon-selection';
    }
    
    checkPokemonSelectionComplete() {
        const pokemonName = document.getElementById('starter-pokemon').value;
        const confirmBtn = document.getElementById('confirm-pokemon-btn');
        
        if (pokemonName) {
            confirmBtn.disabled = false;
        } else {
            confirmBtn.disabled = true;
        }
    }
    
    async confirmPokemonSelection() {
        const pokemonName = document.getElementById('starter-pokemon').value;
        this.showLoading(true);
        
        try {
            const pokemon = await this.fetchPokemon(pokemonName);
            
            // Add to collection with wins tracking
            const pokemonWithStats = {
                ...pokemon,
                wins: 0,
                isEvolved: false,
                originalName: pokemonName
            };
            
            this.pokemonCollection = [pokemonWithStats];
            this.activePokemon = pokemonWithStats;
            
            this.saveGameData();
            this.showDashboard();
            
        } catch (error) {
            this.showError('Failed to load Pokemon data. Please try again.');
            this.showLoading(false);
        }
    }
    
    showDashboard() {
        this.showLoading(false);
        
        // Hide other sections
        document.getElementById('trainer-setup-section').classList.add('d-none');
        document.getElementById('pokemon-selection-section').classList.add('d-none');
        document.getElementById('trainer-dashboard').classList.remove('d-none');
        
        // Update dashboard
        this.updateDashboard();
        this.updatePokemonCollection();
        this.updateActivePokemonSelector();
        this.gameState = 'dashboard';
    }
    
    updateDashboard() {
        document.getElementById('trainer-name-display').textContent = this.trainerName;
        document.getElementById('total-wins').textContent = this.totalWins;
        document.getElementById('gym-badges').textContent = this.gymBadges;
        document.getElementById('pokemon-collection-count').textContent = this.pokemonCollection.length;
        
        // Update battle availability
        this.updateBattleAvailability();
    }
    
    updateBattleAvailability() {
        const practiceBattleBtn = document.getElementById('practice-battle-btn');
        const gymChallengeBtn = document.getElementById('gym-challenge-btn');
        const gymStatusText = document.getElementById('gym-status-text');
        
        // Practice battle availability
        if (this.activePokemon) {
            practiceBattleBtn.disabled = false;
        } else {
            practiceBattleBtn.disabled = true;
        }
        
        // Gym challenge availability (5 wins + 2+ Pokemon)
        const canChallengeGym = this.totalWins >= 5 && this.pokemonCollection.length >= 2;
        
        if (canChallengeGym) {
            gymChallengeBtn.disabled = false;
            gymStatusText.textContent = 'Ready to challenge!';
            gymStatusText.className = 'text-success d-block mt-2';
        } else {
            gymChallengeBtn.disabled = true;
            if (this.totalWins < 5) {
                gymStatusText.textContent = `Need ${5 - this.totalWins} more wins`;
            } else {
                gymStatusText.textContent = 'Need at least 2 Pokemon';
            }
            gymStatusText.className = 'text-muted d-block mt-2';
        }
    }
    
    updatePokemonCollection() {
        const container = document.getElementById('pokemon-collection-display');
        container.innerHTML = '';
        
        this.pokemonCollection.forEach((pokemon) => {
            const item = document.createElement('div');
            item.className = `collection-pokemon-item ${pokemon.isEvolved ? 'evolved-pokemon' : ''}`;
            
            const evolutionProgress = Math.min((pokemon.wins / 15) * 100, 100);
            const canEvolve = pokemon.wins >= 15 && !pokemon.isEvolved && this.evolutionMap[pokemon.originalName];
            
            item.innerHTML = `
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <div class="pokemon-name">${this.capitalize(pokemon.name)}</div>
                <div class="pokemon-wins">${pokemon.wins} wins</div>
                ${canEvolve ? '<small class="text-warning">Ready to evolve!</small>' : ''}
                <div class="evolution-progress">
                    <div class="evolution-bar" style="width: ${evolutionProgress}%"></div>
                </div>
            `;
            
            container.appendChild(item);
        });
    }
    
    updateActivePokemonSelector() {
        const select = document.getElementById('current-pokemon-select');
        select.innerHTML = '<option value="">Select Pokemon...</option>';
        
        this.pokemonCollection.forEach((pokemon, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = this.capitalize(pokemon.name);
            if (this.activePokemon && pokemon.name === this.activePokemon.name) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }
    
    changeActivePokemon() {
        const selectedIndex = document.getElementById('current-pokemon-select').value;
        if (selectedIndex !== '') {
            this.activePokemon = this.pokemonCollection[parseInt(selectedIndex)];
            this.updateBattleAvailability();
            this.saveGameData();
        }
    }
    
    async startPracticeBattle() {
        if (!this.activePokemon) return;
        
        this.showLoading(true);
        
        try {
            // Select random opponent
            const opponentName = this.practiceOpponents[Math.floor(Math.random() * this.practiceOpponents.length)];
            const opponentPokemonName = this.starterPokemonList[Math.floor(Math.random() * this.starterPokemonList.length)];
            const opponentPokemon = await this.fetchPokemon(opponentPokemonName);
            
            // Setup battle
            this.currentBattle = {
                type: 'practice',
                opponent: opponentName,
                playerPokemon: { ...this.activePokemon },
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
        if (!this.activePokemon || this.pokemonCollection.length < 2) return;
        
        this.showLoading(true);
        
        try {
            // Get gym leader based on badges
            const gymLeaderKey = Object.keys(this.gymLeaders)[this.gymBadges % Object.keys(this.gymLeaders).length];
            const gymLeader = this.gymLeaders[gymLeaderKey];
            const opponentPokemonName = gymLeader.pokemon[Math.floor(Math.random() * gymLeader.pokemon.length)];
            const opponentPokemon = await this.fetchPokemon(opponentPokemonName);
            
            // Setup gym battle
            this.currentBattle = {
                type: 'gym',
                opponent: gymLeader.name,
                badge: gymLeader.badge,
                playerPokemon: { ...this.activePokemon },
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
    
    showBattleArena() {
        this.showLoading(false);
        document.getElementById('trainer-dashboard').classList.add('d-none');
        document.getElementById('battle-arena').classList.remove('d-none');
        
        // Update battle info
        document.getElementById('battle-type').textContent = this.currentBattle.type === 'gym' ? 'Gym Challenge' : 'Practice Battle';
        document.getElementById('opponent-name').textContent = this.currentBattle.opponent;
        document.getElementById('opponent-badge-level').textContent = this.currentBattle.type === 'gym' ? 'Gym Leader' : 'Trainer';
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
                image: data.sprites.other['official-artwork']?.front_default || data.sprites.front_default,
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
    
    async endBattle(winner) {
        document.getElementById('attack-btn').disabled = true;
        
        if (winner === 'player') {
            this.totalWins++;
            
            // Update active Pokemon wins
            const activeIndex = this.pokemonCollection.findIndex(p => p.name === this.activePokemon.name);
            if (activeIndex !== -1) {
                this.pokemonCollection[activeIndex].wins++;
                
                // Check for evolution (15 wins)
                const pokemon = this.pokemonCollection[activeIndex];
                if (pokemon.wins >= 15 && !pokemon.isEvolved && this.evolutionMap[pokemon.originalName]) {
                    await this.evolvePokemon(activeIndex);
                }
            }
            
            // Give random Pokemon after every 2 wins
            if (this.totalWins % 2 === 0) {
                await this.giveRandomPokemon();
            }
            
            if (this.currentBattle.type === 'gym') {
                this.gymBadges++;
                this.addLogEntry(`🏆 Victory! You earned the ${this.currentBattle.badge}!`, 'victory');
            } else {
                this.addLogEntry(`🎉 Victory! You gained valuable experience!`, 'victory');
            }
            
            this.saveGameData();
            
            setTimeout(() => {
                this.showVictoryModal();
            }, 1000);
            
        } else {
            this.addLogEntry(`💔 Defeat! ${this.currentBattle.opponent} wins this battle!`, 'defeat');
            
            setTimeout(() => {
                this.showDefeatModal();
            }, 1000);
        }
    }
    
    async evolvePokemon(pokemonIndex) {
        const pokemon = this.pokemonCollection[pokemonIndex];
        const evolutionName = this.evolutionMap[pokemon.originalName];
        
        try {
            const evolvedData = await this.fetchPokemon(evolutionName);
            
            this.pokemonCollection[pokemonIndex] = {
                ...evolvedData,
                wins: pokemon.wins,
                isEvolved: true,
                originalName: pokemon.originalName
            };
            
            // Update active Pokemon if it's the one that evolved
            if (this.activePokemon && this.activePokemon.name === pokemon.name) {
                this.activePokemon = this.pokemonCollection[pokemonIndex];
            }
            
            this.addLogEntry(`🌟 ${this.capitalize(pokemon.name)} evolved into ${this.capitalize(evolutionName)}!`, 'victory');
            
        } catch (error) {
            console.error('Evolution failed:', error);
        }
    }
    
    async giveRandomPokemon() {
        try {
            const availablePokemon = this.starterPokemonList.filter(name => 
                !this.pokemonCollection.some(p => p.originalName === name)
            );
            
            if (availablePokemon.length > 0) {
                const randomPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
                const newPokemon = await this.fetchPokemon(randomPokemon);
                
                const pokemonWithStats = {
                    ...newPokemon,
                    wins: 0,
                    isEvolved: false,
                    originalName: randomPokemon
                };
                
                this.pokemonCollection.push(pokemonWithStats);
                this.addLogEntry(`🎁 You received a new Pokemon: ${this.capitalize(randomPokemon)}!`, 'victory');
            }
        } catch (error) {
            console.error('Failed to give random Pokemon:', error);
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
            let message = `
                <h5>Great job, ${this.trainerName}!</h5>
                <p>You defeated ${this.currentBattle.opponent} in practice battle!</p>
                <div class="mt-3">
                    <p><i class="fas fa-trophy text-success"></i> Total Wins: ${this.totalWins}</p>
            `;
            
            if (this.totalWins % 2 === 0) {
                message += '<p class="text-primary">🎁 You received a new Pokemon!</p>';
            }
            
            message += '</div>';
            
            title.innerHTML = '<i class="fas fa-star text-success"></i> Victory!';
            content.innerHTML = message;
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
        this.updatePokemonCollection();
        this.updateActivePokemonSelector();
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
            pokemonCollection: this.pokemonCollection,
            activePokemon: this.activePokemon,
            totalWins: this.totalWins,
            gymBadges: this.gymBadges,
            winsUntilNextPokemon: this.winsUntilNextPokemon
        };
        
        localStorage.setItem('pokemonGymBattleGame', JSON.stringify(gameData));
    }
    
    loadGameData() {
        const savedData = localStorage.getItem('pokemonGymBattleGame');
        
        if (savedData) {
            const gameData = JSON.parse(savedData);
            this.trainerName = gameData.trainerName || '';
            this.pokemonCollection = gameData.pokemonCollection || [];
            this.activePokemon = gameData.activePokemon || null;
            this.totalWins = gameData.totalWins || 0;
            this.gymBadges = gameData.gymBadges || 0;
            this.winsUntilNextPokemon = gameData.winsUntilNextPokemon || 2;
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