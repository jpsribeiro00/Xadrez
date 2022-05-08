const FILES = new Array(8).fill(undefined).map((_, i) => String.fromCharCode('a'.charCodeAt(0) + i));
const RANKS = new Array(8).fill(undefined).map((_, index) => index + 1);

let observer = new MutationObserver(() => {});

window.onload = () => {
    setupInitialPiecesPositions();
    addEventListenerOnSquares();
    const player2 = document.getElementById('player-2')

    observer.observe(player2, {
        attributes: true
    });
};

const setupInitialPiecesPositions = () => {
    const pawns = new Array(8)
        .fill('pawn');
    const borderPieces = [
        'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'
    ];
    insertIntoFile(8, borderPieces, 'black');
    insertIntoFile(7, pawns, 'black');
    insertIntoFile(2, pawns, 'white');
    insertIntoFile(1, borderPieces, 'white');
};

const insertIntoFile = (rank, pieces, player) => {
    FILES.forEach((file, i) => {
        const id = `${file}${rank}`;
        const piece = pieces[i];
        const pieceDomElement = buildPiece(piece, player);
        document.getElementById(id).appendChild(pieceDomElement);
    });
};

const buildPiece = (piece, player) => {
    const pieceDomElement = document.createElement('div');
    pieceDomElement.setAttribute('class', `piece piece--${player} fas fa-chess-${piece}`);
    pieceDomElement.setAttribute('piece', piece);
    pieceDomElement.setAttribute('player', player);
    return pieceDomElement;
}

const addEventListenerOnSquares = () => {
    const squares = Array.from(document.getElementsByClassName('square'));
    squares.forEach(square => square.addEventListener('mousedown', event => handleMouseDownOnSquare(event)));
    squares.forEach(square => square.addEventListener('mouseup', event => handleMouseUpOnSquare(event)));
};

const removeEventListenerOnSquares = () => {
    const squares = Array.from(document.getElementsByClassName('square'));
    squares.forEach(square => square.replaceWith(square.cloneNode(true)));
}

const handleMouseUpOnSquare = event => {
    const isSquareAvailableMove = event.target.attributes.highlighted &&
        !!event.target.attributes.highlighted.value;
    
    if (isSquareAvailableMove) {
        const selectedPiece = document.querySelector('[selected=true]');

        if(selectedPiece !== null){
            let clonePiece = selectedPiece.cloneNode(true);
            clonePiece.setAttribute('alreadyMoved', true);
            selectedPiece.parentNode.removeChild(selectedPiece);

            event.target.appendChild(clonePiece);
        }
    }
    removeSelectedPiece();
    cleanHighlightedSquares();
};

const highlightSquare = (coordinates, specialMove) => {
    const element = document.getElementById(coordinates);
    if (element === null) {
        return;
    }
    element.setAttribute('highlighted', true);
    if (specialMove) {
        element.setAttribute('specialMove', specialMove);
    }
};

const highlightPawnAvailableMoves = (player, coordinates, alreadyMoved) => {
    const [startFile, startRank] = coordinates.split('');
    let availableMovementMoves = [getMoveRankCoordinates(startRank, 1, player)];
    availableMovementMoves = availableMovementMoves
        .map(rank => `${startFile}${rank}`)
        .filter(coordinates => getPieceFromCoordinates(coordinates) === null);
    if (!alreadyMoved && availableMovementMoves.length > 0) {
        const extraMove = getMoveRankCoordinates(startRank, 2, player);
        const extraMoveCoordinates = `${startFile}${extraMove}`;
        if (getPieceFromCoordinates(extraMoveCoordinates) === null) {
            availableMovementMoves.push(extraMoveCoordinates);
        }
    }
    const availableAttackMoves = [
            getMoveFileCoordinates(startFile, 1, player),
            getMoveFileCoordinates(startFile, -1, player)
        ]
        .map(file => `${file}${getMoveRankCoordinates(startRank, 1, player)}`)
        .filter(coordinates => getPieceFromCoordinates(coordinates) !== null)
        .filter(coordinates => getPlayerFromCoordinates(coordinates) !== player);

    const enPassantMoves = [
            getMoveFileCoordinates(startFile, 1, player),
            getMoveFileCoordinates(startFile, -1, player),
        ]
        .map(file => `${file}${startRank}`)
        .filter(square => {
            const piece = getPieceObjFromCoordinates(square);
            return piece &&
                piece.attributes.canExecuteEnPassant &&
                piece.attributes.canExecuteEnPassant.value === 'true';
        })
        .map(square => `${square.split('')[0]}${Number.parseInt(square.split('')[1])+1}`);

    availableMovementMoves.forEach(square => highlightSquare(square));
    availableAttackMoves.forEach(square => highlightSquare(square));
    enPassantMoves.forEach(square => highlightSquare(square, 'enPassant'));
};

const getHighlightAvailableMovesFnBySelectedPiece = (piece) => {
    const MapPiescesToAvailableMovesFn = {
        pawn: highlightPawnAvailableMoves
    };
    return MapPiescesToAvailableMovesFn[piece] ||
        (() => console.log('A peça selecionada não possui uma função de movimento implementada'));
};

const removeSelectedPiece = () => {
    const selectedPiece = document.querySelector('[selected=true]');
    if (selectedPiece) {
        selectedPiece.setAttribute('selected', false);
    }
};

const getPieceFromCoordinates = (coordinates, player) => {
    const domElement = document.getElementById(coordinates);
    if (domElement === null) {
        return null;
    }
    const childElement = domElement.firstChild;
    if (!childElement) {
        return null;
    }
    const piece = player === undefined ?
        childElement && childElement.attributes.piece.value :
        childElement && childElement.attributes.piece.value && childElement.attributes.player.value === value;
    return piece;
}

const getMoveRankCoordinates = (startRank, numberOfSquares, player) => {
    const playerVariant = player === 'white' ? 1 : -1;
    const startRankNumber = typeof startRank === 'string' ?
        Number.parseInt(startRank) :
        startRank;
    return startRankNumber + numberOfSquares * playerVariant;
}

const getMoveFileCoordinates = (startFile, numberOfSquares, player) => {
    const playerVariant = player === 'white' ? 1 : -1;
    const startFileIndex = FILES.indexOf(startFile);
    const finalFileIndex = startFileIndex + numberOfSquares * playerVariant;
    return FILES[finalFileIndex];
}

const getPieceObjFromCoordinates = (coordinates) => {
    const domElement = document.getElementById(coordinates);
    if (domElement === null) {
        return null;
    }
    const childElement = domElement.firstChild;
    if (!childElement) {
        return null;
    }

    return childElement;
}

const getPlayerFromCoordinates = coordinates => {
    const domElement = document.getElementById(coordinates);
    if (domElement === null) {
        return null;
    }
    const childElement = domElement.firstChild;
    const player = childElement && childElement.attributes.player.value;
    return player;
}

const cleanHighlightedSquares = () => {
    document
        .querySelectorAll('[highlighted]')
        .forEach(el => el.removeAttribute('highlighted'));
};

const handleMouseDownOnSquare = event => {
    event.preventDefault() // Impede que tabuleiro seja arrastado junto
    const coordinates = event.target.id;
    const piece = getPieceFromCoordinates(coordinates);
    if (!piece) {
        console.log(`Peça na coordenada ${coordinates.toUpperCase()}: vazio`);
        return;
    }
    event.target.firstChild.setAttribute('selected', true);
    const pieceColor = event.target.firstChild.attributes.player.value;
    console.log(`Peça na coordenada ${coordinates.toUpperCase()}: ${piece} ${pieceColor}`);

    const hightlightAvailableMovesFn = getHighlightAvailableMovesFnBySelectedPiece(piece);
    const alreadyMoved = event.target.firstChild.attributes.alreadyMoved &&
        event.target.firstChild.attributes.alreadyMoved.value;
    hightlightAvailableMovesFn(pieceColor, coordinates, alreadyMoved);
};