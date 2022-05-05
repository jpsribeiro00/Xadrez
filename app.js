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

const handleMouseUpOnSquare = event => {

    const selectedPiece = document.querySelector('[selected=true]');

    if(selectedPiece !== null){
        let clonePiece = selectedPiece.cloneNode(true);
        clonePiece.setAttribute('alreadyMoved', true);
        selectedPiece.parentNode.removeChild(selectedPiece);

        event.target.appendChild(clonePiece);
        removeSelectedPiece();
    }
};

const removeSelectedPiece = () => {
    const selectedPiece = document.querySelector('[selected=true]');
    if (selectedPiece) {
        selectedPiece.setAttribute('selected', false);
    }
};

const handleMouseDownOnSquare = event => {
    event.preventDefault() // Impede que tabuleiro seja arrastado junto

    if(event.target.firstChild !== null){
        event.target.firstChild.setAttribute('selected', true);
    }
};