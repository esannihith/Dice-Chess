# Die-Chess-Rules

### 1. Game Start and the Opening

This is where your dice mechanic has the most dramatic and immediate impact compared to standard chess.

- **The First Move:** The game starts with White's turn. White rolls the die.
- **Outcome of the Roll:**
    - If White rolls **Pawn** or **Knight**, they can make a legal opening move.
    - If White rolls **Bishop, Rook, Queen, or King**, none of these pieces have a legal move from their starting position. Therefore, White **forfeits their turn**.
- **Implication:** There is a significant chance (`45%` with our suggested probabilities) that the first player forfeits their turn. Rolling a Pawn or Knight on the first move is a major advantage. This completely changes opening theory and adds a crucial element of luck from the very first roll. The same logic applies to Black's first turn.

### 2. Castling

Castling is a special move that needs a specific trigger, as it involves two pieces (King and Rook).

- **The Trigger:** To be eligible to castle, you must roll **King**.
- **The Rule:** If you roll a King, and all standard castling conditions are met (neither the King nor the chosen Rook has moved; the squares between them are clear; the King is not in check and does not pass through or land on a square under attack), you may choose **castling** as your move for the turn.
- **Clarification:** Rolling **Rook** does *not* allow you to castle. The move is fundamentally a King move for safety, so it is tied to the King's roll.

### 3. Pawn Promotion

We have a solid rule for this, which we can formalize here.

- **The Event:** Your pawn reaches the opponent's back rank. The move is now over.
- **The Rule:** On the same turn, you must roll the die to determine the promotion piece.
    - You promote the pawn to the piece type rolled (Queen, Rook, Bishop, or Knight).
    - If you roll a **King** or a **Pawn**, you must re-roll until a valid promotion piece is rolled.

### 4. Check

This is a core mechanic we've refined. Here is the complete rule for clarity.

- **The State:** Your King is in check. You must use your turn to resolve it.
- **The Rule - Your Two Choices:**
    1. **Move the King (The Safe Option):** You can choose to move your King to a safe square without rolling the die.
    2. **Roll the Die (The Risk/Reward Option):** You can roll the die as normal. If the rolled piece can legally resolve the check (by moving, blocking, or capturing), you **must** make that move. If the rolled piece cannot help, you **forfeit your turn**, remain in check, and play passes to your opponent.
- **Checkmate:** Checkmate occurs when a player is in check, and no legal King move or possible die roll can resolve the situation.

### 5. Piece Capture

This functions very intuitively within the system.

- **The Action:** You roll the die (e.g., you roll "Queen"). You then look at your Queen(s) on the board. If one of them can make a legal move to a square occupied by an opponent's piece, you may make that capture.
- **The Rule:** A capture is just like any other move. It must be legal according to the piece's standard movement.
- **No Bonus:** As established, there is **no second throw** or any other bonus for capturing an opponent's piece. Your turn ends.

### 6. Remaining Cases (Special Moves & Draws)

These are important edge cases that need clear definitions.

- **En Passant:** This special pawn capture is now a rare event requiring both opportunity and luck.
    - **The Rule:** To perform an *en passant* capture, two conditions must be met simultaneously:
        1. **The Opportunity:** Your opponent must have just moved their pawn two squares forward, landing it beside your pawn.
        2. **The Roll:** On your immediately following turn, you must roll **Pawn**.
    - If both conditions are met, you may perform the *en passant* capture. If you roll any other piece, the opportunity is lost forever.
- **Stalemate:**
    - **The Rule:** The game is a draw by stalemate if the player whose turn it is **is not in check**, but has no legal moves available for **any** of their pieces on the board (regardless of what they could roll).
- **Other Draws:**
    - Standard rules for draws remain in effect and are independent of the dice. This includes:
        - Draw by agreement (players agree to a draw).
        - Threefold repetition (the same board position occurs three times with the same player to move).
        - The 50-move rule (50 moves have passed without a capture or a pawn move).