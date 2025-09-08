// Pokemon Gym Battle Simulator - Advanced Progression System

class PokemonGymBattleGame {
    constructor() {
        // Game state
        this.gameState = 'trainer-setup'; // trainer-setup, pokemon-selection, dashboard, battle
        this.trainerName = '';
        this.pokemonCollection = [];
        this.battleTeam = []; // Max 3 Pokemon for battle
        this.totalWins = 0;
        this.totalLosses = 0;
        this.practiceWins = 0;
        this.practiceLosses = 0;
        this.gymWins = 0;
        this.gymLosses = 0;
        this.gymBadges = 0;
        this.currentBattle = null;
        this.pendingPokemonUnlock = null;
        this.currentStage = 1;
        
        // Pokemon stages and unlock requirements
        this.stageUnlockRequirements = {
            1: { winsRequired: 0, winsPerUnlock: 2, maxWins: 20 },    // Stage 1: Every 2 wins until 20 total wins
            2: { winsRequired: 20, winsPerUnlock: 3, maxWins: 35 },   // Stage 2: After 20 wins, every 3 wins until 35 total
            3: { winsRequired: 35, winsPerUnlock: 3, maxWins: 50 },   // Stage 3: After 35 wins, every 3 wins until 50 total
            4: { winsRequired: 50, winsPerUnlock: 3, maxWins: 70 },   // Stage 4: After 50 wins, every 3 wins until 70 total
            5: { winsRequired: 70, winsPerUnlock: 3, maxWins: 999 }   // Stage 5: After 70 wins, every 3 wins (unlimited)
        };
        
        // Pokemon by stage
        this.pokemonByStage = {
            1: ['pikachu', 'bulbasaur', 'charmander', 'squirtle', 'machop', 'geodude', 'psyduck', 'poliwag', 'abra', 'slowpoke', 'magikarp', 'eevee', 'meowth', 'oddish', 'bellsprout', 'tentacool', 'ponyta', 'magnemite', 'seel', 'grimer'],
            2: ['ivysaur', 'charmeleon', 'wartortle', 'raichu', 'machoke', 'graveler', 'golduck', 'poliwhirl', 'kadabra', 'slowbro', 'gyarados', 'persian', 'gloom', 'weepinbell', 'tentacruel', 'rapidash', 'magneton', 'dewgong', 'muk', 'vaporeon'],
            3: ['venusaur', 'charizard', 'blastoise', 'alakazam', 'machamp', 'golem', 'poliwrath', 'victreebel', 'vileplume', 'arcanine', 'nidoking', 'nidoqueen', 'cloyster', 'gengar', 'onix', 'rhyhorn', 'chansey', 'tangela', 'kangaskhan', 'scyther'],
            4: ['dragonair', 'aerodactyl', 'snorlax', 'articuno', 'zapdos', 'moltres', 'dratini', 'lapras', 'hitmonlee', 'hitmonchan', 'lickitung', 'koffing', 'rhyhorn', 'chansey', 'tangela', 'kangaskhan', 'scyther', 'jynx', 'electabuzz', 'magmar'],
            5: ['dragonite', 'mewtwo', 'mew', 'lugia', 'ho-oh', 'celebi', 'kyogre', 'groudon', 'rayquaza', 'dialga', 'palkia', 'giratina', 'arceus', 'reshiram', 'zekrom', 'kyurem', 'xerneas', 'yveltal', 'zygarde', 'necrozma']
        };
        
        // Practice battle opponents
        this.practiceOpponents = [
            'youngster joey', 'lass sarah', 'bug catcher tim', 'picnicker lisa',
            'hiker mike', 'fisherman bob', 'sailor jack', 'camper alex',
            'school kid ben', 'twins amy', 'black belt koichi', 'bird keeper rod'
        ];
        
        // Gym leaders
        this.gymLeaders = {
            brock: { name: 'Brock', pokemon: ['onix', 'geodude'], badge: 'Boulder Badge' },
            misty: { name: 'Misty', pokemon: ['staryu', 'starmie'], badge: 'Cascade Badge' },
            surge: { name: 'Lt. Surge', pokemon: ['voltorb', 'pikachu', 'raichu'], badge: 'Thunder Badge' },
            erika: { name: 'Erika', pokemon: ['victreebel', 'tangela', 'vileplume'], badge: 'Rainbow Badge' },
            koga: { name: 'Koga', pokemon: ['koffing', 'muk', 'weezing'], badge: 'Soul Badge' },
            sabrina: { name: 'Sabrina', pokemon: ['kadabra', 'alakazam', 'mr-mime'], badge: 'Marsh Badge' },
            blaine: { name: 'Blaine', pokemon: ['growlithe', 'arcanine', 'rapidash'], badge: 'Volcano Badge' },
            giovanni: { name: 'Giovanni', pokemon: ['rhyhorn', 'dugtrio', 'nidoking'], badge: 'Earth Badge' }
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
        
        const sortedPokemon = [...this.pokemonByStage[1]].sort();
        
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
        
        // Battle buttons
        const practiceBattleBtn = document.getElementById('practice-battle-btn');
        if (practiceBattleBtn) {
            practiceBattleBtn.addEventListener('click', () => {
                this.initiatePracticeBattle();
            });
        }
        
        const gymChallengeBtn = document.getElementById('gym-challenge-btn');
        if (gymChallengeBtn) {
            gymChallengeBtn.addEventListener('click', () => {
                this.initiateGymChallenge();
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
        
        // Modal controls
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('victory-modal'));
                if (modal) modal.hide();
                this.backToDashboard();
            });
        }
        
        const claimPokemonBtn = document.getElementById('claim-pokemon-btn');
        if (claimPokemonBtn) {
            claimPokemonBtn.addEventListener('click', () => {
                this.claimNewPokemon();
            });
        }
        
        const skipOpponentBtn = document.getElementById('skip-opponent-btn');
        if (skipOpponentBtn) {
            skipOpponentBtn.addEventListener('click', () => {
                this.skipOpponent();
            });
        }
        
        const startBattleBtn = document.getElementById('start-battle-btn');
        if (startBattleBtn) {
            startBattleBtn.addEventListener('click', () => {
                this.confirmBattleStart();
            });
        }
        
        const changeTeamBtn = document.getElementById('change-team-btn');
        if (changeTeamBtn) {
            changeTeamBtn.addEventListener('click', () => {
                this.showTeamSelection();
            });
        }
        
        const confirmTeamBtn = document.getElementById('confirm-team-btn');
        if (confirmTeamBtn) {
            confirmTeamBtn.addEventListener('click', () => {
                this.confirmTeamSelection();
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
            
            // Add to collection with stage tracking
            const pokemonWithStats = {
                ...pokemon,
                stage: 1,
                wins: 0,
                originalName: pokemonName
            };
            
            this.pokemonCollection = [pokemonWithStats];
            this.battleTeam = [pokemonWithStats]; // Auto-select as battle team
            
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
        this.updateBattleTeamSelection();
        this.updateCurrentStage();
        this.gameState = 'dashboard';
    }
    
    updateDashboard() {
        document.getElementById('trainer-name-display').textContent = this.trainerName;
        document.getElementById('total-wins').textContent = this.totalWins;
        document.getElementById('total-losses').textContent = this.totalLosses;
        document.getElementById('practice-wins').textContent = this.practiceWins;
        document.getElementById('practice-losses').textContent = this.practiceLosses;
        document.getElementById('gym-wins').textContent = this.gymWins;
        document.getElementById('gym-losses').textContent = this.gymLosses;
        document.getElementById('gym-badges').textContent = this.gymBadges;
        document.getElementById('pokemon-collection-count').textContent = this.pokemonCollection.length;
        
        // Update battle availability
        this.updateBattleAvailability();
    }
    
    updateBattleAvailability() {
        const practiceBattleBtn = document.getElementById('practice-battle-btn');
        const gymChallengeBtn = document.getElementById('gym-challenge-btn');
        const gymStatusText = document.getElementById('gym-status-text');
        
        // Practice battle availability (need at least 1 Pokemon selected)
        if (this.battleTeam.length > 0) {
            practiceBattleBtn.disabled = false;
        } else {
            practiceBattleBtn.disabled = true;
        }
        
        // Gym challenge availability (5 wins + 2+ Pokemon)
        const canChallengeGym = this.totalWins >= 5 && this.pokemonCollection.length >= 2;
        
        if (canChallengeGym && this.battleTeam.length >= 2) {
            gymChallengeBtn.disabled = false;
            gymStatusText.textContent = 'Ready to challenge!';
            gymStatusText.className = 'text-success d-block mt-2';
        } else {
            gymChallengeBtn.disabled = true;
            if (this.totalWins < 5) {
                gymStatusText.textContent = `Need ${5 - this.totalWins} more wins`;
            } else if (this.pokemonCollection.length < 2) {
                gymStatusText.textContent = 'Need at least 2 Pokemon';
            } else if (this.battleTeam.length < 2) {
                gymStatusText.textContent = 'Select at least 2 Pokemon for battle';
            }
            gymStatusText.className = 'text-muted d-block mt-2';
        }
    }
    
    updateCurrentStage() {
        // Determine current stage based on total wins
        for (let stage = 5; stage >= 1; stage--) {
            const stageInfo = this.stageUnlockRequirements[stage];
            if (this.totalWins >= stageInfo.winsRequired && this.totalWins <= stageInfo.maxWins) {
                this.currentStage = stage;
                break;
            }
        }
    }
    
    updatePokemonCollection() {
        const container = document.getElementById('pokemon-collection-display');
        container.innerHTML = '';
        
        this.pokemonCollection.forEach((pokemon, index) => {
            const item = document.createElement('div');
            item.className = `collection-pokemon-item ${pokemon.stage >= 2 ? 'evolved-pokemon' : ''}`;
            
            const evolutionProgress = Math.min((pokemon.wins / 15) * 100, 100);
            
            item.innerHTML = `
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <div class="pokemon-name">${this.capitalize(pokemon.name)}</div>
                <div class="pokemon-wins">${pokemon.wins} wins</div>
                <span class="stage-indicator stage-${pokemon.stage}">Stage ${pokemon.stage}</span>
                <div class="evolution-progress">
                    <div class="evolution-bar" style="width: ${evolutionProgress}%"></div>
                </div>
            `;
            
            container.appendChild(item);
        });
    }
    
    updateBattleTeamSelection() {
        const container = document.getElementById('battle-team-selection');
        container.innerHTML = '';
        
        // Show current battle team with position indicators
        this.battleTeam.forEach((pokemon, index) => {
            const card = this.createDraggablePokemonCard(pokemon, index + 1);
            card.dataset.source = 'team';
            card.dataset.originalIndex = index;
            container.appendChild(card);
        });
        
        // Add empty slots for remaining team positions
        for (let i = this.battleTeam.length; i < 3; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'pokemon-card-draggable empty-slot';
            emptySlot.innerHTML = `
                <div class="battle-position-indicator">${i + 1}</div>
                <div class="pokemon-card-info">
                    <div class="drop-zone-empty">Drop Pokemon here</div>
                </div>
            `;
            container.appendChild(emptySlot);
        }
        
        this.setupDragAndDrop();
    }
    
    updateBattleTeam(pokemonIndex, isSelected) {
        const pokemon = this.pokemonCollection[pokemonIndex];
        
        if (isSelected) {
            // Add to battle team if not already there and under limit
            if (this.battleTeam.length < 3 && !this.battleTeam.some(p => p.name === pokemon.name)) {
                this.battleTeam.push(pokemon);
            }
        } else {
            // Remove from battle team
            this.battleTeam = this.battleTeam.filter(p => p.name !== pokemon.name);
        }
        
        this.updateBattleTeamSelection();
        this.updateBattleAvailability();
        this.saveGameData();
    }
    
    async initiatePracticeBattle() {
        if (this.battleTeam.length === 0) return;
        
        this.showLoading(true);
        
        try {
            // Generate opponent team matching player team size
            const opponentName = this.practiceOpponents[Math.floor(Math.random() * this.practiceOpponents.length)];
            const opponentTeam = [];
            
            // Generate opponent Pokemon of similar or slightly lower stage
            for (let i = 0; i < this.battleTeam.length; i++) {
                const playerMaxStage = Math.max(...this.battleTeam.map(p => p.stage));
                const opponentStage = Math.max(1, playerMaxStage - Math.floor(Math.random() * 2));
                const availablePokemon = this.pokemonByStage[opponentStage];
                const randomPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
                
                const pokemon = await this.fetchPokemon(randomPokemon);
                pokemon.stage = opponentStage;
                opponentTeam.push(pokemon);
            }
            
            // Show opponent preview
            this.showOpponentPreview(opponentName, [...this.battleTeam], opponentTeam, 'practice');
            
        } catch (error) {
            this.showError('Failed to generate opponent. Please try again.');
            this.showLoading(false);
        }
    }
    
    async initiateGymChallenge() {
        if (this.battleTeam.length < 2) return;
        
        this.showLoading(true);
        
        try {
            // Get gym leader based on badges
            const gymLeaderKey = Object.keys(this.gymLeaders)[this.gymBadges % Object.keys(this.gymLeaders).length];
            const gymLeader = this.gymLeaders[gymLeaderKey];
            const opponentTeam = [];
            
            // Generate gym leader team (stronger Pokemon, matching player team size)
            const neededPokemon = Math.min(this.battleTeam.length, 3);
            for (let i = 0; i < neededPokemon; i++) {
                const pokemonName = gymLeader.pokemon[i % gymLeader.pokemon.length];
                const pokemon = await this.fetchPokemon(pokemonName);
                const playerMaxStage = Math.max(...this.battleTeam.map(p => p.stage));
                pokemon.stage = Math.min(5, playerMaxStage + 1); // Slightly higher stage
                opponentTeam.push(pokemon);
            }
            
            // Show opponent preview
            this.showOpponentPreview(gymLeader.name, [...this.battleTeam], opponentTeam, 'gym', gymLeader.badge);
            
        } catch (error) {
            this.showError('Failed to generate gym challenge. Please try again.');
            this.showLoading(false);
        }
    }
    
    showOpponentPreview(opponentName, playerTeam, opponentTeam, battleType, badge = null) {
        this.showLoading(false);
        
        // Store battle data for later use
        this.pendingBattle = {
            type: battleType,
            opponent: opponentName,
            badge: badge,
            playerTeam: playerTeam,
            opponentTeam: opponentTeam
        };
        
        // Update preview modal
        document.getElementById('preview-opponent-name').textContent = opponentName;
        
        // Show player team
        this.updatePlayerTeamPreview();
        
        // Show opponent team (Pokemon visible but stats hidden until battle starts)
        const opponentPreview = document.getElementById('opponent-team-preview');
        opponentPreview.innerHTML = '';
        opponentTeam.forEach(pokemon => {
            const div = document.createElement('div');
            div.className = 'preview-pokemon';
            div.innerHTML = `
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <div class="preview-pokemon-info">
                    <div class="preview-pokemon-name">${this.capitalize(pokemon.name)}</div>
                    <div class="preview-pokemon-stage">Stage ${pokemon.stage}</div>
                    <div class="preview-pokemon-hp">Stats: Hidden</div>
                </div>
            `;
            opponentPreview.appendChild(div);
        });
        
        // Show preview modal
        const modal = new bootstrap.Modal(document.getElementById('opponent-preview-modal'));
        modal.show();
    }
    
    skipOpponent() {
        // Close modal and generate new opponent
        const modal = bootstrap.Modal.getInstance(document.getElementById('opponent-preview-modal'));
        if (modal) modal.hide();
        
        // Regenerate opponent based on battle type
        if (this.pendingBattle.type === 'practice') {
            this.initiatePracticeBattle();
        } else {
            this.initiateGymChallenge();
        }
    }
    
    confirmBattleStart() {
        // Close modal and start battle
        const modal = bootstrap.Modal.getInstance(document.getElementById('opponent-preview-modal'));
        if (modal) modal.hide();
        
        this.startBattle();
    }
    
    showTeamSelection() {
        document.getElementById('player-team-preview').classList.add('d-none');
        document.getElementById('team-selection-preview').classList.remove('d-none');
        
        // Show current battle team with drag-and-drop reordering
        const teamContainer = document.getElementById('preview-team-selection');
        teamContainer.innerHTML = '';
        
        this.battleTeam.forEach((pokemon, index) => {
            const card = this.createDraggablePokemonCard(pokemon, index + 1);
            card.dataset.source = 'team';
            card.dataset.originalIndex = index;
            teamContainer.appendChild(card);
        });
        
        // Add empty slots
        for (let i = this.battleTeam.length; i < 3; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'pokemon-card-draggable empty-slot';
            emptySlot.innerHTML = `
                <div class="battle-position-indicator">${i + 1}</div>
                <div class="pokemon-card-info">
                    <div class="drop-zone-empty">Drop Pokemon here</div>
                </div>
            `;
            teamContainer.appendChild(emptySlot);
        }
        
        // Show available Pokemon
        const availableContainer = document.getElementById('available-pokemon-list');
        availableContainer.innerHTML = '';
        
        const availablePokemon = this.pokemonCollection.filter(p => 
            !this.battleTeam.some(tp => tp.name === p.name)
        );
        
        availablePokemon.forEach(pokemon => {
            const card = this.createDraggablePokemonCard(pokemon);
            card.dataset.source = 'available';
            availableContainer.appendChild(card);
        });
        
        this.setupPreviewDragAndDrop();
    }
    
    confirmTeamSelection() {
        // The team has already been updated through drag and drop
        if (this.battleTeam.length === 0) {
            alert('Please select at least one Pokemon for battle!');
            return;
        }
        
        this.saveGameData();
        
        // Hide team selection and update preview
        document.getElementById('team-selection-preview').classList.add('d-none');
        document.getElementById('player-team-preview').classList.remove('d-none');
        
        // Update player team preview with new team
        this.updatePlayerTeamPreview();
    }
    
    updatePlayerTeamPreview() {
        const playerPreview = document.getElementById('player-team-preview');
        playerPreview.innerHTML = '';
        this.battleTeam.forEach(pokemon => {
            const div = document.createElement('div');
            div.className = 'preview-pokemon';
            div.innerHTML = `
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <div class="preview-pokemon-info">
                    <div class="preview-pokemon-name">${this.capitalize(pokemon.name)}</div>
                    <div class="preview-pokemon-stage">Stage ${pokemon.stage}</div>
                    <div class="preview-pokemon-hp">HP: ${pokemon.maxHP}</div>
                </div>
            `;
            playerPreview.appendChild(div);
        });
    }
    
    createDraggablePokemonCard(pokemon, position = null) {
        const card = document.createElement('div');
        card.className = 'pokemon-card-draggable';
        card.draggable = true;
        card.dataset.pokemonName = pokemon.name;
        
        card.innerHTML = `
            ${position ? `<div class="battle-position-indicator">${position}</div>` : ''}
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <div class="pokemon-card-info">
                <div class="pokemon-card-name">${this.capitalize(pokemon.name)}</div>
                <div class="pokemon-card-stage">Stage ${pokemon.stage}</div>
                <div class="pokemon-card-hp">HP: ${pokemon.maxHP}</div>
            </div>
        `;
        
        // Add drag event listeners
        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', pokemon.name);
            e.dataTransfer.setData('application/json', JSON.stringify({
                pokemon: pokemon,
                source: card.dataset.source,
                originalIndex: card.dataset.originalIndex
            }));
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
        
        return card;
    }
    
    setupDragAndDrop() {
        const container = document.getElementById('battle-team-selection');
        this.setupDropZone(container);
    }
    
    setupPreviewDragAndDrop() {
        const teamContainer = document.getElementById('preview-team-selection');
        const availableContainer = document.getElementById('available-pokemon-list');
        
        this.setupDropZone(teamContainer);
        this.setupDropZone(availableContainer);
    }
    
    setupDropZone(container) {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('drag-over');
        });
        
        container.addEventListener('dragleave', (e) => {
            if (!container.contains(e.relatedTarget)) {
                container.classList.remove('drag-over');
            }
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drag-over');
            
            try {
                const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
                this.handleDrop(dragData, container);
            } catch (error) {
                console.error('Drop failed:', error);
            }
        });
    }
    
    handleDrop(dragData, dropContainer) {
        const { pokemon, source, originalIndex } = dragData;
        const isTeamContainer = dropContainer.id === 'battle-team-selection' || dropContainer.id === 'preview-team-selection';
        const isAvailableContainer = dropContainer.id === 'available-pokemon-list';
        
        if (source === 'team' && isAvailableContainer) {
            // Remove from team
            this.battleTeam = this.battleTeam.filter(p => p.name !== pokemon.name);
        } else if (source === 'available' && isTeamContainer) {
            // Add to team if space available
            if (this.battleTeam.length < 3) {
                this.battleTeam.push(pokemon);
            } else {
                alert('Maximum team size is 3 Pokemon!');
                return;
            }
        } else if (source === 'team' && isTeamContainer) {
            // Reorder within team
            const currentIndex = this.battleTeam.findIndex(p => p.name === pokemon.name);
            if (currentIndex !== -1) {
                // Calculate drop position based on mouse position or container structure
                const dropPosition = this.getDropPosition(dropContainer, event);
                if (dropPosition !== currentIndex) {
                    // Remove from current position
                    this.battleTeam.splice(currentIndex, 1);
                    // Insert at new position
                    this.battleTeam.splice(dropPosition, 0, pokemon);
                }
            }
        }
        
        // Update displays
        this.updateBattleTeamSelection();
        this.updateBattleAvailability();
        this.saveGameData();
        
        // If in preview mode, update preview displays
        if (document.getElementById('team-selection-preview').classList.contains('d-none') === false) {
            this.showTeamSelection();
        }
    }
    
    getDropPosition(container, event) {
        const cards = Array.from(container.querySelectorAll('.pokemon-card-draggable:not(.dragging):not(.empty-slot)'));
        let dropPosition = cards.length;
        
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.top + rect.height / 2;
            
            if (event.clientY < cardCenter) {
                dropPosition = i;
                break;
            }
        }
        
        return Math.min(dropPosition, 2); // Max 3 Pokemon
    }
    
    async startBattle() {
        this.showLoading(true);
        
        // Setup battle with teams
        this.currentBattle = {
            type: this.pendingBattle.type,
            opponent: this.pendingBattle.opponent,
            badge: this.pendingBattle.badge,
            playerTeam: this.pendingBattle.playerTeam.map(p => ({ ...p, currentHP: p.maxHP })),
            opponentTeam: this.pendingBattle.opponentTeam.map(p => ({ ...p, currentHP: p.maxHP })),
            currentTurn: 'player',
            playerActiveIndex: 0,
            opponentActiveIndex: 0
        };
        
        this.showBattleArena();
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
        
        // Display active Pokemon
        this.updateBattleDisplay();
        
        // Clear battle log and add initial entry
        document.getElementById('battle-log').innerHTML = '';
        const playerPokemon = this.currentBattle.playerTeam[this.currentBattle.playerActiveIndex];
        const opponentPokemon = this.currentBattle.opponentTeam[this.currentBattle.opponentActiveIndex];
        this.addLogEntry(`${this.currentBattle.playerTeam.length}v${this.currentBattle.opponentTeam.length} Battle begins! ${this.capitalize(playerPokemon.name)} vs ${this.capitalize(opponentPokemon.name)}!`, 'system');
        
        // Enable attack button
        document.getElementById('attack-btn').disabled = false;
        this.gameState = 'battle';
    }
    
    updateBattleDisplay() {
        const playerPokemon = this.currentBattle.playerTeam[this.currentBattle.playerActiveIndex];
        const opponentPokemon = this.currentBattle.opponentTeam[this.currentBattle.opponentActiveIndex];
        
        // Display current active Pokemon
        this.displayBattlePokemon(playerPokemon, 'player');
        this.displayBattlePokemon(opponentPokemon, 'opponent');
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
            console.log('Player attack blocked - game state:', this.gameState, 'turn:', this.currentBattle?.currentTurn);
            return;
        }
        
        document.getElementById('attack-btn').disabled = true;
        
        const playerPokemon = this.currentBattle.playerTeam[this.currentBattle.playerActiveIndex];
        const opponentPokemon = this.currentBattle.opponentTeam[this.currentBattle.opponentActiveIndex];
        
        console.log('Player attack:', {
            playerPokemon: playerPokemon.name,
            playerHP: playerPokemon.currentHP,
            opponentPokemon: opponentPokemon.name,
            opponentHP: opponentPokemon.currentHP,
            playerActiveIndex: this.currentBattle.playerActiveIndex,
            opponentActiveIndex: this.currentBattle.opponentActiveIndex
        });
        
        // Add attack animation
        document.getElementById('player-image').classList.add('attacking');
        setTimeout(() => {
            document.getElementById('player-image').classList.remove('attacking');
        }, 500);
        
        // Calculate damage
        const damage = this.calculateDamage(playerPokemon, opponentPokemon);
        opponentPokemon.currentHP = Math.max(0, opponentPokemon.currentHP - damage);
        
        // Update display
        this.updateHPBar(opponentPokemon, 'opponent');
        
        // Add to battle log
        this.addLogEntry(
            `${this.capitalize(playerPokemon.name)} attacks for ${damage} damage!`,
            'player-turn'
        );
        
        // Check if opponent Pokemon is defeated
        if (opponentPokemon.currentHP <= 0) {
            this.handlePokemonDefeated('opponent');
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
        
        const playerPokemon = this.currentBattle.playerTeam[this.currentBattle.playerActiveIndex];
        const opponentPokemon = this.currentBattle.opponentTeam[this.currentBattle.opponentActiveIndex];
        
        // Add attack animation
        document.getElementById('opponent-image').classList.add('attacking');
        setTimeout(() => {
            document.getElementById('opponent-image').classList.remove('attacking');
        }, 500);
        
        // Calculate damage
        const damage = this.calculateDamage(opponentPokemon, playerPokemon);
        playerPokemon.currentHP = Math.max(0, playerPokemon.currentHP - damage);
        
        // Update display
        this.updateHPBar(playerPokemon, 'player');
        
        // Add to battle log
        this.addLogEntry(
            `${this.capitalize(opponentPokemon.name)} attacks for ${damage} damage!`,
            'computer-turn'
        );
        
        // Check if player Pokemon is defeated
        if (playerPokemon.currentHP <= 0) {
            this.handlePokemonDefeated('player');
            return;
        }
        
        // Switch back to player turn
        this.currentBattle.currentTurn = 'player';
        document.getElementById('attack-btn').disabled = false;
    }
    
    handlePokemonDefeated(defeatedSide) {
        const defeatedIndex = defeatedSide === 'player' ? this.currentBattle.playerActiveIndex : this.currentBattle.opponentActiveIndex;
        const defeatedTeam = defeatedSide === 'player' ? this.currentBattle.playerTeam : this.currentBattle.opponentTeam;
        const defeatedPokemon = defeatedTeam[defeatedIndex];
        
        this.addLogEntry(`${this.capitalize(defeatedPokemon.name)} is defeated!`, 'system');
        
        // Check for next Pokemon
        let nextIndex = -1;
        for (let i = 0; i < defeatedTeam.length; i++) {
            if (i !== defeatedIndex && defeatedTeam[i].currentHP > 0) {
                nextIndex = i;
                break;
            }
        }
        
        if (nextIndex !== -1) {
            // Switch to next Pokemon
            if (defeatedSide === 'player') {
                this.currentBattle.playerActiveIndex = nextIndex;
            } else {
                this.currentBattle.opponentActiveIndex = nextIndex;
            }
            
            const nextPokemon = defeatedTeam[nextIndex];
            this.addLogEntry(`${defeatedSide === 'player' ? this.trainerName : this.currentBattle.opponent} sends out ${this.capitalize(nextPokemon.name)}!`, 'system');
            
            this.updateBattleDisplay();
            
            // Continue battle
            if (defeatedSide === 'opponent') {
                this.currentBattle.currentTurn = 'player';
                document.getElementById('attack-btn').disabled = false;
            } else {
                this.currentBattle.currentTurn = 'opponent';
                setTimeout(() => {
                    this.opponentAttack();
                }, 2000);
            }
        } else {
            // End battle - no more Pokemon
            this.endBattle(defeatedSide === 'player' ? 'opponent' : 'player');
        }
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
            
            if (this.currentBattle.type === 'practice') {
                this.practiceWins++;
            } else {
                this.gymWins++;
                this.gymBadges++;
            }
            
            // Update Pokemon wins for battle team
            this.battleTeam.forEach(battlePokemon => {
                const collectionIndex = this.pokemonCollection.findIndex(p => p.name === battlePokemon.name);
                if (collectionIndex !== -1) {
                    this.pokemonCollection[collectionIndex].wins++;
                }
            });
            
            // Check for Pokemon unlock
            await this.checkForPokemonUnlock();
            
            if (this.currentBattle.type === 'gym') {
                this.addLogEntry(`🏆 Victory! You earned the ${this.currentBattle.badge}!`, 'victory');
            } else {
                this.addLogEntry(`🎉 Victory! Great battle!`, 'victory');
            }
            
            this.saveGameData();
            
            setTimeout(() => {
                this.showVictoryModal();
            }, 1000);
            
        } else {
            this.totalLosses++;
            
            if (this.currentBattle.type === 'practice') {
                this.practiceLosses++;
            } else {
                this.gymLosses++;
            }
            
            this.addLogEntry(`💔 Defeat! ${this.currentBattle.opponent} wins this battle!`, 'defeat');
            this.saveGameData();
            
            setTimeout(() => {
                this.showDefeatModal();
            }, 1000);
        }
    }
    
    async checkForPokemonUnlock() {
        this.updateCurrentStage();
        
        // Check if we should unlock a Pokemon from current stage
        const shouldUnlock = this.shouldUnlockPokemon();
        
        if (shouldUnlock) {
            const currentStageInfo = this.stageUnlockRequirements[this.currentStage];
            const availablePokemon = this.pokemonByStage[this.currentStage].filter(name => 
                !this.pokemonCollection.some(p => p.originalName === name)
            );
            
            if (availablePokemon.length > 0) {
                const randomPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
                const newPokemon = await this.fetchPokemon(randomPokemon);
                
                this.pendingPokemonUnlock = {
                    ...newPokemon,
                    stage: this.currentStage,
                    wins: 0,
                    originalName: randomPokemon
                };
                
                console.log('Pokemon unlock triggered:', this.pendingPokemonUnlock);
                
                // Show unlock modal after victory modal
                setTimeout(() => {
                    this.showPokemonUnlockModal();
                }, 3000);
            }
        }
    }
    
    shouldUnlockPokemon() {
        const currentStageInfo = this.stageUnlockRequirements[this.currentStage];
        
        // Check if we're still within the stage range
        if (this.totalWins > currentStageInfo.maxWins) {
            return false; // Should have moved to next stage
        }
        
        // For stage 1, check every 2 wins starting from 2
        if (this.currentStage === 1) {
            // First Pokemon is starter, unlock second at 2 wins, third at 4 wins, etc.
            const expectedPokemonCount = Math.floor(this.totalWins / 2) + 1;
            const currentStageCount = this.pokemonCollection.filter(p => p.stage === 1).length;
            return expectedPokemonCount > currentStageCount && this.totalWins >= 2;
        }
        
        // For stages 2+, check every 3 wins after reaching the stage
        const winsAfterStageStart = this.totalWins - currentStageInfo.winsRequired;
        if (winsAfterStageStart <= 0) return false;
        
        const expectedPokemonCount = Math.floor(winsAfterStageStart / 3);
        const currentStageCount = this.pokemonCollection.filter(p => p.stage === this.currentStage).length;
        
        console.log('Stage unlock check:', {
            totalWins: this.totalWins,
            currentStage: this.currentStage,
            winsAfterStageStart: winsAfterStageStart,
            expectedPokemonCount: expectedPokemonCount,
            currentStageCount: currentStageCount
        });
        
        return expectedPokemonCount > currentStageCount && winsAfterStageStart % 3 === 0;
    }
    
    showPokemonUnlockModal() {
        if (!this.pendingPokemonUnlock) return;
        
        const unlockDisplay = document.getElementById('unlock-pokemon-display');
        const unlockMessage = document.getElementById('unlock-message');
        
        const isStage1 = this.pendingPokemonUnlock.stage === 1;
        const stageName = isStage1 ? 'Basic' : `Stage ${this.pendingPokemonUnlock.stage}`;
        const currentCollectionCount = this.pokemonCollection.length + 1; // +1 for the new one
        
        unlockMessage.textContent = `Unlock your ${isStage1 ? this.getOrdinalNumber(currentCollectionCount) : 'new'} Pokemon!`;
        
        unlockDisplay.innerHTML = `
            <img src="${this.pendingPokemonUnlock.image}" alt="${this.pendingPokemonUnlock.name}">
            <div class="pokemon-name">${this.capitalize(this.pendingPokemonUnlock.name)}</div>
            <span class="stage-indicator stage-${this.pendingPokemonUnlock.stage}">${stageName} Stage</span>
            <p class="mt-2 text-muted">A new ${stageName.toLowerCase()} Pokemon joins your team!</p>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('pokemon-unlock-modal'));
        modal.show();
    }
    
    getOrdinalNumber(num) {
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const v = num % 100;
        return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    }
    
    claimNewPokemon() {
        if (this.pendingPokemonUnlock) {
            this.pokemonCollection.push(this.pendingPokemonUnlock);
            this.pendingPokemonUnlock = null;
            this.saveGameData();
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('pokemon-unlock-modal'));
        if (modal) modal.hide();
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
                <p>You defeated ${this.currentBattle.opponent} in a ${this.battleTeam.length}v${this.currentBattle.opponentTeam.length} battle!</p>
                <div class="mt-3">
                    <p><i class="fas fa-trophy text-success"></i> Total Wins: ${this.totalWins}</p>
            `;
            
            if (this.pendingPokemonUnlock) {
                message += '<p class="text-primary">🎁 You unlocked a new Pokemon!</p>';
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
                <p><i class="fas fa-times text-danger"></i> Total Losses: ${this.totalLosses}</p>
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
        this.updateBattleTeamSelection();
        this.currentBattle = null;
        this.pendingBattle = null;
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
            battleTeam: this.battleTeam,
            totalWins: this.totalWins,
            totalLosses: this.totalLosses,
            practiceWins: this.practiceWins,
            practiceLosses: this.practiceLosses,
            gymWins: this.gymWins,
            gymLosses: this.gymLosses,
            gymBadges: this.gymBadges,
            currentStage: this.currentStage
        };
        
        localStorage.setItem('pokemonGymBattleGame', JSON.stringify(gameData));
    }
    
    loadGameData() {
        const savedData = localStorage.getItem('pokemonGymBattleGame');
        
        if (savedData) {
            const gameData = JSON.parse(savedData);
            this.trainerName = gameData.trainerName || '';
            this.pokemonCollection = gameData.pokemonCollection || [];
            this.battleTeam = gameData.battleTeam || [];
            this.totalWins = gameData.totalWins || 0;
            this.totalLosses = gameData.totalLosses || 0;
            this.practiceWins = gameData.practiceWins || 0;
            this.practiceLosses = gameData.practiceLosses || 0;
            this.gymWins = gameData.gymWins || 0;
            this.gymLosses = gameData.gymLosses || 0;
            this.gymBadges = gameData.gymBadges || 0;
            this.currentStage = gameData.currentStage || 1;
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