### ## Algorithm 1: The Opening Roll (First 3-4 Moves)

The goal here is to prevent the game from stalling at the very beginning. Rolling a Bishop or Rook on the first move results in a forfeit, which isn't very fun.

- **Trigger:** Active for the first 3 or 4 moves of each player, or until a piece other than a Pawn or Knight is moved.
- **Logic:** Heavily prioritizes the only two piece types that can legally move from the starting position.
- **Example Probabilities:**
    - **Pawn:** 45%
    - **Knight:** 45%
    - **Bishop, Rook, Queen, King:** The remaining 10% split between them (2.5% each).

This ensures the game gets started smoothly, making the first few die rolls critical for establishing an early advantage.

---

### ## Algorithm 2: The Promotion "Revival" Roll

This is your idea, and it's a great one. The die roll for promotion shouldn't be random; it should be a chance to recover what you've lost.

- **Trigger:** A pawn reaches the final rank.
- **Logic:** The probability of promoting to a certain piece is proportional to the value of pieces you have lost. You are "reviving" your army.
- **Example Calculation:**
    1. Look at the pieces your opponent has captured from you (Queen, Rooks, Bishops, Knights).
    2. Assign points to these lost pieces: **Queen (9 pts)**, **Rook (5 pts)**, **Bishop (3 pts)**, **Knight (3 pts)**.
    3. Let's say you've lost your Queen and one Knight. The total point pool is `9 + 3 = 12`.
    4. The probability of promoting to a Queen is `9 / 12 = 75%`.
    5. The probability of promoting to a Knight is `3 / 12 = 25%`.
    6. (Probabilities for Rook and Bishop would be 0% since you haven't lost any).
    7. If you haven't lost any pieces, the probability is an equal 25% for each of the four valid promotion pieces.

---

### ## Algorithm 3: The "Desperation" Roll (Under Check) 🛡️

When in check, a player isn't just making any move; they are trying to survive. The die roll should reflect this desperation by favoring pieces that can actually help.

- **Trigger:** The player's King is in check, and they choose the "Roll the Die" option.
- **Logic:** The algorithm identifies all "savior" pieces—those that can legally resolve the check—and gives them a massive probability boost.
- **Example Calculation:**
    1. The system scans the board to find all legal moves that get the King out of check.
    2. Let's say a Bishop can block the attack and a Knight can capture the attacker. The King can also move to a safe square. These are the "savior" moves.
    3. The pieces capable of these moves (**Bishop**, **Knight**, **King**) are now given a high chance to be rolled, perhaps sharing **80-90%** of the probability.
    4. All other pieces that have no legal moves to save the King share the remaining **10-20%**.

This makes the "Roll the Die" option a calculated risk rather than a completely random gamble. You have a good chance of rolling a piece you need, but it's not guaranteed.

---

### ## General Algorithm: The Dynamic Mid-Game Roll

For all other "normal" turns, the probability should dynamically reflect the pieces you have on the board. This ensures the King always has a low probability and that the value of your remaining army is represented.

- **Trigger:** Any normal turn not covered by the special algorithms above.
- **Logic:** The probability of rolling a piece is based on how many of that piece you have left and its inherent value.
- **Example Calculation:**
    1. Assign a "base weight" to each piece type: **Pawn (1)**, **Knight (3)**, **Bishop (3)**, **Rook (5)**, **Queen (9)**. The **King** gets a special low, fixed weight, say **(0.5)**, to always keep its probability low.
    2. Multiply the number of pieces you have of each type by their base weight.
        - You have 6 Pawns -> Score = `6 * 1 = 6`
        - You have 1 Knight -> Score = `1 * 3 = 3`
        - You have 1 Queen -> Score = `1 * 9 = 9`
        - You have 1 King -> Score = `1 * 0.5 = 0.5`
    3. The total score is `6 + 3 + 9 + 0.5 = 18.5`.
    4. The probability of rolling a Pawn is `6 / 18.5 ≈ 32%`. The probability of rolling a Queen is `9 / 18.5 ≈ 48%`. The King's chance is `0.5 / 18.5 ≈ 3%`.