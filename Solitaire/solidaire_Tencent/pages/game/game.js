// pages/game/game.js - Solitaire Klondike Complet
const app = getApp();
const firebase = require('../../utils/firebase');

// Constantes du jeu
const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const SUIT_COLORS = { spades: 'black', hearts: 'red', diamonds: 'red', clubs: 'black' };
const SUIT_SYMBOLS = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const FOUNDATION_ORDER = ['spades', 'hearts', 'diamonds', 'clubs']; // Ordre des foundations

Page({
    data: {
        // Piles de jeu
        stock: [],           // Pioche (cartes face cachée)
        waste: [],           // Défausse (cartes retournées)
        foundations: [[], [], [], []], // 4 piles de fondation (As → Roi)
        tableau: [[], [], [], [], [], [], []], // 7 colonnes du tableau

        // État du jeu
        gameWon: false,
        moves: 0,
        time: 0,
        formattedTime: '0:00',
        timerInterval: null,

        // État de sélection et drag
        selectedCards: [],
        selectedSource: null,
        isDragging: false,
        dragCurrentX: 0,
        dragCurrentY: 0,

        // Auto-complete
        canAutoComplete: false,
        isAutoCompleting: false,

        // UI
        screenWidth: 375,
        topRowHeight: 200,
        showWinModal: false,

        // Historique pour Undo
        history: [],
        canUndo: false,

        // Hint (Indice)
        hintSource: null,
        hintTarget: null,
        showingHint: false
    },

    onLoad() {
        const sysInfo = wx.getSystemInfoSync();
        this.setData({ screenWidth: sysInfo.windowWidth });
        this.initGame();
        
        // Logger le démarrage de la partie
        firebase.logGameStart();
    },

    onUnload() {
        this.stopTimer();
        
        // Logger le temps passé dans le jeu si la partie n'est pas terminée
        if (!this.data.gameWon) {
            firebase.logUserAction('game_abandoned', {
                time_played: this.data.time,
                moves_made: this.data.moves
            });
        }
    },

    // ==================== INITIALISATION ====================

    initGame() {
        this.stopTimer();

        // Créer et mélanger le deck
        const deck = this.createDeck();
        this.shuffleDeck(deck);

        // Distribuer aux 7 colonnes du tableau
        // Colonne 1: 1 carte, Colonne 2: 2 cartes, etc.
        const tableau = [[], [], [], [], [], [], []];
        let cardIndex = 0;

        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = { ...deck[cardIndex++] };
                // Seule la dernière carte de chaque colonne est face visible
                card.faceUp = (row === col);
                tableau[col].push(card);
            }
        }

        // Les 24 cartes restantes vont dans la pioche
        const stock = deck.slice(cardIndex).map(card => ({
            ...card,
            faceUp: false
        }));

        this.setData({
            stock,
            waste: [],
            foundations: [[], [], [], []],
            tableau,
            gameWon: false,
            showWinModal: false,
            moves: 0,
            time: 0,
            formattedTime: '0:00',
            selectedCards: [],
            selectedSource: null,
            isDragging: false,
            canAutoComplete: false,
            isAutoCompleting: false,
            history: [],
            canUndo: false
        });

        this.startTimer();
    },

    // Créer un deck de 52 cartes
    createDeck() {
        const deck = [];
        for (const suit of SUITS) {
            for (let i = 0; i < VALUES.length; i++) {
                deck.push({
                    id: `${suit}-${VALUES[i]}`,
                    suit: suit,
                    value: VALUES[i],
                    numValue: i + 1, // A=1, 2=2, ..., K=13
                    color: SUIT_COLORS[suit],
                    symbol: SUIT_SYMBOLS[suit],
                    faceUp: false
                });
            }
        }
        return deck;
    },

    // Mélanger le deck (Fisher-Yates)
    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    },

    // ==================== TIMER ====================

    startTimer() {
        const timerInterval = setInterval(() => {
            if (!this.data.gameWon) {
                const newTime = this.data.time + 1;
                const mins = Math.floor(newTime / 60);
                const secs = newTime % 60;
                const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`;
                this.setData({ time: newTime, formattedTime });
            }
        }, 1000);
        this.setData({ timerInterval });
    },

    stopTimer() {
        if (this.data.timerInterval) {
            clearInterval(this.data.timerInterval);
            this.setData({ timerInterval: null });
        }
    },

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // ==================== SAUVEGARDE ÉTAT (pour Undo) ====================

    saveState() {
        const state = {
            stock: JSON.parse(JSON.stringify(this.data.stock)),
            waste: JSON.parse(JSON.stringify(this.data.waste)),
            foundations: JSON.parse(JSON.stringify(this.data.foundations)),
            tableau: JSON.parse(JSON.stringify(this.data.tableau)),
            moves: this.data.moves
        };

        const history = [...this.data.history, state];
        // Limiter l'historique à 20 états
        if (history.length > 20) history.shift();

        this.setData({ history, canUndo: true });
    },

    undo() {
        if (this.data.history.length === 0) return;

        const history = [...this.data.history];
        const prevState = history.pop();

        this.setData({
            stock: prevState.stock,
            waste: prevState.waste,
            foundations: prevState.foundations,
            tableau: prevState.tableau,
            moves: prevState.moves,
            history,
            canUndo: history.length > 0,
            selectedCards: [],
            selectedSource: null
        });

        wx.vibrateShort({ type: 'light' });
    },

    // ==================== PIOCHE (STOCK) ====================

    onStockTap() {
        if (this.data.gameWon || this.data.isAutoCompleting) return;

        this.saveState();

        const stock = [...this.data.stock];
        const waste = [...this.data.waste];

        if (stock.length > 0) {
            // Piocher une carte
            const card = stock.pop();
            card.faceUp = true;
            waste.push(card);

            this.setData({
                stock,
                waste,
                moves: this.data.moves + 1,
                selectedCards: [],
                selectedSource: null
            });
        } else if (waste.length > 0) {
            // Retourner la défausse dans la pioche
            while (waste.length > 0) {
                const card = waste.pop();
                card.faceUp = false;
                stock.push(card);
            }

            this.setData({
                stock,
                waste,
                moves: this.data.moves + 1,
                selectedCards: [],
                selectedSource: null
            });
        }

        wx.vibrateShort({ type: 'light' });
        this.checkAutoCompletePossible();
    },

    // ==================== VALIDATION DES MOUVEMENTS ====================

    // Peut-on placer cette carte sur une fondation?
    canMoveToFoundation(card, foundationIndex) {
        const foundation = this.data.foundations[foundationIndex];
        const expectedSuit = FOUNDATION_ORDER[foundationIndex];

        if (foundation.length === 0) {
            // Fondation vide: seul un As de la bonne couleur peut être placé
            return card.value === 'A' && card.suit === expectedSuit;
        }

        const topCard = foundation[foundation.length - 1];
        // Même couleur (suit) et valeur suivante
        return card.suit === topCard.suit && card.numValue === topCard.numValue + 1;
    },

    // Peut-on empiler cette carte sur une autre dans le tableau?
    canStackOnTableau(cardToMove, targetCard) {
        if (!targetCard) {
            // Colonne vide: seul un Roi peut être placé
            return cardToMove.value === 'K';
        }

        // La carte cible doit être face visible
        if (!targetCard.faceUp) return false;

        // Couleurs alternées et valeur décroissante
        const differentColor = cardToMove.color !== targetCard.color;
        const correctValue = cardToMove.numValue === targetCard.numValue - 1;

        return differentColor && correctValue;
    },

    // Trouver la fondation appropriée pour une carte
    findFoundationForCard(card) {
        // Trouver l'index de la fondation correspondant à la couleur de la carte
        const foundationIndex = FOUNDATION_ORDER.indexOf(card.suit);
        
        if (foundationIndex >= 0 && this.canMoveToFoundation(card, foundationIndex)) {
            return foundationIndex;
        }
        
        return -1;
    },

    // ==================== DÉPLACEMENT DES CARTES ====================

    // Déplacer vers une fondation
    moveToFoundation(card, cards, source, foundationIndex) {
        if (cards.length !== 1) return false; // On ne peut déplacer qu'une carte vers la fondation
        if (!this.canMoveToFoundation(card, foundationIndex)) return false;

        this.saveState();

        const foundations = JSON.parse(JSON.stringify(this.data.foundations));
        foundations[foundationIndex].push({ ...card });

        // Retirer la carte de la source
        if (source.type === 'waste') {
            const waste = [...this.data.waste];
            waste.pop();
            this.setData({ waste, foundations, moves: this.data.moves + 1 });
        } else if (source.type === 'tableau') {
            const tableau = JSON.parse(JSON.stringify(this.data.tableau));
            tableau[source.col].pop();

            // Retourner la nouvelle carte du dessus si elle existe
            if (tableau[source.col].length > 0) {
                tableau[source.col][tableau[source.col].length - 1].faceUp = true;
            }

            this.setData({ tableau, foundations, moves: this.data.moves + 1 });
        }

        wx.vibrateShort({ type: 'medium' });
        this.clearSelection();
        this.checkWin();
        this.checkAutoCompletePossible();

        return true;
    },

    // Déplacer vers le tableau
    moveToTableau(cards, source, targetCol) {
        if (cards.length === 0) return false;

        const targetColumn = this.data.tableau[targetCol];
        const targetCard = targetColumn.length > 0 ? targetColumn[targetColumn.length - 1] : null;

        // Vérifier si le mouvement est valide
        if (!this.canStackOnTableau(cards[0], targetCard)) return false;

        // Ne pas déplacer vers la même colonne
        if (source.type === 'tableau' && source.col === targetCol) return false;

        this.saveState();

        const tableau = JSON.parse(JSON.stringify(this.data.tableau));

        // Ajouter les cartes à la colonne cible
        for (const card of cards) {
            tableau[targetCol].push({ ...card, faceUp: true });
        }

        // Retirer les cartes de la source
        if (source.type === 'waste') {
            const waste = [...this.data.waste];
            waste.pop();
            this.setData({ waste, tableau, moves: this.data.moves + 1 });
        } else if (source.type === 'tableau') {
            // Retirer les cartes déplacées
            tableau[source.col].splice(source.cardIndex);

            // Retourner la nouvelle carte du dessus
            if (tableau[source.col].length > 0) {
                tableau[source.col][tableau[source.col].length - 1].faceUp = true;
            }

            this.setData({ tableau, moves: this.data.moves + 1 });
        }

        wx.vibrateShort({ type: 'light' });
        this.clearSelection();
        this.checkAutoCompletePossible();

        return true;
    },

    // ==================== GESTION DE LA SÉLECTION ====================

    clearSelection() {
        this.setData({
            selectedCards: [],
            selectedSource: null,
            isDragging: false
        });
    },

    // ==================== ÉVÉNEMENTS TACTILES ====================

    // Tap sur la défausse
    onWasteTap() {
        if (this.data.gameWon || this.data.isAutoCompleting) return;
        if (this.data.waste.length === 0) return;

        const topCard = this.data.waste[this.data.waste.length - 1];

        // Si une sélection existe déjà, on désélectionne
        if (this.data.selectedCards.length > 0) {
            this.clearSelection();
            return;
        }

        // Essayer d'abord de déplacer vers une fondation (auto-move)
        const foundationIdx = this.findFoundationForCard(topCard);
        if (foundationIdx >= 0) {
            this.moveToFoundation(topCard, [topCard], { type: 'waste' }, foundationIdx);
            return;
        }

        // Sinon, sélectionner la carte
        this.setData({
            selectedCards: [topCard],
            selectedSource: { type: 'waste' }
        });

        wx.vibrateShort({ type: 'light' });
    },

    // Drag depuis la défausse
    onWasteDragStart(e) {
        if (this.data.gameWon || this.data.isAutoCompleting) return;
        if (this.data.waste.length === 0) return;

        const touch = e.touches[0];
        const topCard = this.data.waste[this.data.waste.length - 1];

        this.setData({
            isDragging: true,
            selectedCards: [topCard],
            selectedSource: { type: 'waste' },
            dragCurrentX: touch.clientX,
            dragCurrentY: touch.clientY
        });

        wx.vibrateShort({ type: 'light' });
    },

    // Tap sur une carte du tableau
    onTableauCardTap(e) {
        if (this.data.gameWon || this.data.isAutoCompleting) return;

        const { col, cardindex } = e.currentTarget.dataset;
        const colIdx = parseInt(col);
        const cardIdx = parseInt(cardindex);
        const column = this.data.tableau[colIdx];

        if (!column || cardIdx >= column.length) return;

        const card = column[cardIdx];

        // Carte face cachée - ne rien faire
        if (!card.faceUp) return;

        // Si on a déjà une sélection, essayer de déplacer
        if (this.data.selectedCards.length > 0 && this.data.selectedSource) {
            // Essayer de déplacer sur cette carte
            const targetCard = column[column.length - 1];
            if (card.id === targetCard.id) {
                // On clique sur la carte du dessus - essayer de déplacer dessus
                const success = this.moveToTableau(
                    this.data.selectedCards,
                    this.data.selectedSource,
                    colIdx
                );
                if (!success) {
                    this.clearSelection();
                }
                return;
            } else {
                this.clearSelection();
                return;
            }
        }

        // Double-clic détection: si on clique 2x sur la même carte du dessus
        // Auto-move vers fondation pour TOUTE carte cliquée du dessus (pas seulement si elle peut bouger)
        if (cardIdx === column.length - 1) {
            const foundationIdx = this.findFoundationForCard(card);
            if (foundationIdx >= 0) {
                this.moveToFoundation(
                    card,
                    [card],
                    { type: 'tableau', col: colIdx, cardIndex: cardIdx },
                    foundationIdx
                );
                return;
            }
        }

        // Sélectionner cette carte et toutes celles en dessous
        const cardsToSelect = column.slice(cardIdx);

        this.setData({
            selectedCards: cardsToSelect,
            selectedSource: { type: 'tableau', col: colIdx, cardIndex: cardIdx }
        });

        wx.vibrateShort({ type: 'light' });
    },

    // Drag depuis le tableau
    onTableauDragStart(e) {
        if (this.data.gameWon || this.data.isAutoCompleting) return;

        const { col, cardindex } = e.currentTarget.dataset;
        const colIdx = parseInt(col);
        const cardIdx = parseInt(cardindex);
        const column = this.data.tableau[colIdx];

        if (!column || cardIdx >= column.length) return;

        const card = column[cardIdx];
        if (!card.faceUp) return;

        const touch = e.touches[0];
        const cardsToMove = column.slice(cardIdx);

        this.setData({
            isDragging: true,
            selectedCards: cardsToMove,
            selectedSource: { type: 'tableau', col: colIdx, cardIndex: cardIdx },
            dragCurrentX: touch.clientX,
            dragCurrentY: touch.clientY
        });

        wx.vibrateShort({ type: 'light' });
    },

    // Tap sur une colonne vide du tableau
    onEmptyColumnTap(e) {
        if (this.data.gameWon || this.data.isAutoCompleting) return;
        if (this.data.selectedCards.length === 0) return;

        const { col } = e.currentTarget.dataset;
        const colIdx = parseInt(col);

        // Vérifier que la première carte est un Roi
        if (this.data.selectedCards[0].value === 'K') {
            this.moveToTableau(this.data.selectedCards, this.data.selectedSource, colIdx);
        } else {
            this.clearSelection();
            wx.vibrateShort({ type: 'heavy' });
        }
    },

    // Tap sur une fondation
    onFoundationTap(e) {
        if (this.data.gameWon || this.data.isAutoCompleting) return;
        if (this.data.selectedCards.length !== 1) {
            this.clearSelection();
            return;
        }

        const { index } = e.currentTarget.dataset;
        const foundationIdx = parseInt(index);

        const success = this.moveToFoundation(
            this.data.selectedCards[0],
            this.data.selectedCards,
            this.data.selectedSource,
            foundationIdx
        );

        if (!success) {
            this.clearSelection();
            wx.vibrateShort({ type: 'heavy' });
        }
    },

    // Mouvement du drag
    onDragMove(e) {
        if (!this.data.isDragging) return;

        const touch = e.touches[0];
        this.setData({
            dragCurrentX: touch.clientX,
            dragCurrentY: touch.clientY
        });
    },

    // Fin du drag
    onDragEnd(e) {
        if (!this.data.isDragging) return;

        const touch = e.changedTouches[0];
        const dropX = touch.clientX;
        const dropY = touch.clientY;

        let moved = false;

        // Zone supérieure = Foundations (zone très étendue pour meilleure détection)
        if (dropY < this.data.topRowHeight + 80 && this.data.selectedCards.length === 1) {
            const foundationStartX = this.data.screenWidth * 0.35;

            if (dropX > foundationStartX) {
                const foundationWidth = (this.data.screenWidth - foundationStartX) / 4;
                const foundationIdx = Math.floor((dropX - foundationStartX + foundationWidth * 0.3) / foundationWidth);

                if (foundationIdx >= 0 && foundationIdx < 4) {
                    moved = this.moveToFoundation(
                        this.data.selectedCards[0],
                        this.data.selectedCards,
                        this.data.selectedSource,
                        foundationIdx
                    );
                }
            }
        }

        // Zone tableau (détection améliorée pour trouver la colonne la plus proche)
        if (!moved && dropY >= this.data.topRowHeight - 50) {
            const columnWidth = this.data.screenWidth / 7;
            
            // Trouver la colonne la plus proche en testant toutes les colonnes
            let bestCol = -1;
            let minDistance = Infinity;
            
            for (let col = 0; col < 7; col++) {
                const colCenterX = (col + 0.5) * columnWidth;
                const distance = Math.abs(dropX - colCenterX);
                
                // Si cette colonne est plus proche et dans une zone raisonnable (1.5x la largeur)
                if (distance < minDistance && distance < columnWidth * 1.5) {
                    minDistance = distance;
                    bestCol = col;
                }
            }
            
            if (bestCol >= 0) {
                moved = this.moveToTableau(
                    this.data.selectedCards,
                    this.data.selectedSource,
                    bestCol
                );
            }
        }

        if (!moved) {
            wx.vibrateShort({ type: 'heavy' });
        }

        this.setData({
            isDragging: false,
            selectedCards: [],
            selectedSource: null
        });
    },

    // ==================== AUTO-COMPLETE ====================

    checkAutoCompletePossible() {
        // Pioche et défausse doivent être vides
        if (this.data.stock.length > 0 || this.data.waste.length > 0) {
            this.setData({ canAutoComplete: false });
            return;
        }

        // Toutes les cartes du tableau doivent être face visible
        for (const col of this.data.tableau) {
            for (const card of col) {
                if (!card.faceUp) {
                    this.setData({ canAutoComplete: false });
                    return;
                }
            }
        }

        this.setData({ canAutoComplete: true });
    },

    autoComplete() {
        if (this.data.isAutoCompleting || this.data.gameWon) return;
        if (!this.data.canAutoComplete) return;

        this.setData({ isAutoCompleting: true });
        this.autoCompleteStep();
    },

    autoCompleteStep() {
        if (this.data.gameWon) {
            this.setData({ isAutoCompleting: false });
            return;
        }

        // Trouver une carte à déplacer vers une fondation
        for (let col = 0; col < 7; col++) {
            const column = this.data.tableau[col];
            if (column.length === 0) continue;

            const topCard = column[column.length - 1];
            const foundationIdx = this.findFoundationForCard(topCard);

            if (foundationIdx >= 0) {
                this.moveToFoundation(
                    topCard,
                    [topCard],
                    { type: 'tableau', col, cardIndex: column.length - 1 },
                    foundationIdx
                );

                // Continuer après un délai
                setTimeout(() => this.autoCompleteStep(), 120);
                return;
            }
        }

        // Aucune carte trouvée
        this.setData({ isAutoCompleting: false });
    },

    // ==================== VÉRIFICATION VICTOIRE ====================

    checkWin() {
        const totalInFoundations = this.data.foundations.reduce((sum, f) => sum + f.length, 0);

        if (totalInFoundations === 52) {
            this.stopTimer();
            app.updateStats(true, this.data.time);
            
            // Logger la victoire dans Firebase
            firebase.logGameEnd(true, this.data.moves, this.data.time);

            this.setData({
                gameWon: true,
                showWinModal: true,
                isAutoCompleting: false,
                canAutoComplete: false
            });

            wx.vibrateLong();
        }
    },

    // ==================== ACTIONS UI ====================

    restartGame() {
        // Logger l'abandon de la partie actuelle si non terminée
        if (!this.data.gameWon) {
            firebase.logUserAction('game_restart', {
                time_played: this.data.time,
                moves_made: this.data.moves
            });
        }
        
        wx.vibrateShort({ type: 'light' });
        this.initGame();
        
        // Logger le démarrage de la nouvelle partie
        firebase.logGameStart();
    },

    goHome() {
        wx.navigateBack();
    },

    // ==================== HINT (INDICE) ====================

    showHint() {
        if (this.data.gameWon || this.data.isAutoCompleting) return;

        // Effacer l'indice précédent
        this.clearHint();

        const hint = this.findBestHint();

        if (hint) {
            this.setData({
                hintSource: hint.source,
                hintTarget: hint.target,
                showingHint: true
            });

            wx.vibrateShort({ type: 'light' });

            // Effacer l'indice après 3 secondes
            setTimeout(() => {
                this.clearHint();
            }, 3000);
        } else {
            // Aucun mouvement trouvé
            wx.showToast({
                title: 'Aucun mouvement possible',
                icon: 'none',
                duration: 1500
            });
            wx.vibrateShort({ type: 'heavy' });
        }
    },

    clearHint() {
        this.setData({
            hintSource: null,
            hintTarget: null,
            showingHint: false
        });
    },

    findBestHint() {
        // Priorité 1: Déplacer vers une fondation depuis le tableau
        for (let col = 0; col < 7; col++) {
            const column = this.data.tableau[col];
            if (column.length === 0) continue;

            const topCard = column[column.length - 1];
            if (!topCard.faceUp) continue;

            for (let f = 0; f < 4; f++) {
                if (this.canMoveToFoundation(topCard, f)) {
                    return {
                        source: { type: 'tableau', col, cardIndex: column.length - 1 },
                        target: { type: 'foundation', index: f }
                    };
                }
            }
        }

        // Priorité 2: Déplacer depuis la défausse vers une fondation
        if (this.data.waste.length > 0) {
            const wasteCard = this.data.waste[this.data.waste.length - 1];
            for (let f = 0; f < 4; f++) {
                if (this.canMoveToFoundation(wasteCard, f)) {
                    return {
                        source: { type: 'waste' },
                        target: { type: 'foundation', index: f }
                    };
                }
            }
        }

        // Priorité 3: Déplacer depuis la défausse vers le tableau
        if (this.data.waste.length > 0) {
            const wasteCard = this.data.waste[this.data.waste.length - 1];
            for (let col = 0; col < 7; col++) {
                const column = this.data.tableau[col];
                const targetCard = column.length > 0 ? column[column.length - 1] : null;

                if (this.canStackOnTableau(wasteCard, targetCard)) {
                    return {
                        source: { type: 'waste' },
                        target: { type: 'tableau', col }
                    };
                }
            }
        }

        // Priorité 4: Déplacer une pile dans le tableau pour révéler une carte cachée
        for (let col = 0; col < 7; col++) {
            const column = this.data.tableau[col];
            if (column.length === 0) continue;

            // Trouver la première carte face visible
            let firstFaceUpIdx = -1;
            for (let i = 0; i < column.length; i++) {
                if (column[i].faceUp) {
                    firstFaceUpIdx = i;
                    break;
                }
            }

            if (firstFaceUpIdx <= 0) continue; // Pas de carte cachée à révéler

            const cardToMove = column[firstFaceUpIdx];

            // Chercher où déplacer cette carte
            for (let targetCol = 0; targetCol < 7; targetCol++) {
                if (targetCol === col) continue;

                const targetColumn = this.data.tableau[targetCol];
                const targetCard = targetColumn.length > 0 ? targetColumn[targetColumn.length - 1] : null;

                if (this.canStackOnTableau(cardToMove, targetCard)) {
                    return {
                        source: { type: 'tableau', col, cardIndex: firstFaceUpIdx },
                        target: { type: 'tableau', col: targetCol }
                    };
                }
            }
        }

        // Priorité 5: Déplacer un Roi vers une colonne vide
        for (let col = 0; col < 7; col++) {
            const column = this.data.tableau[col];
            if (column.length === 0) continue;

            for (let i = 0; i < column.length; i++) {
                const card = column[i];
                if (!card.faceUp) continue;

                if (card.value === 'K' && i > 0) { // Roi pas en première position
                    // Chercher une colonne vide
                    for (let targetCol = 0; targetCol < 7; targetCol++) {
                        if (this.data.tableau[targetCol].length === 0) {
                            return {
                                source: { type: 'tableau', col, cardIndex: i },
                                target: { type: 'tableau', col: targetCol }
                            };
                        }
                    }
                }
            }
        }

        // Priorité 6: Piocher si la pioche n'est pas vide
        if (this.data.stock.length > 0) {
            return {
                source: { type: 'stock' },
                target: { type: 'waste' }
            };
        }

        // Priorité 7: Retourner la défausse
        if (this.data.waste.length > 0 && this.data.stock.length === 0) {
            return {
                source: { type: 'waste-reset' },
                target: { type: 'stock' }
            };
        }

        return null;
    }
});
