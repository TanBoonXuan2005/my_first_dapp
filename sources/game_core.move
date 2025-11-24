module my_first_package::game_core {
    use one::object::{Self, UID};
    use one::transfer;
    use one::tx_context::{Self, TxContext};
    use one::coin::{Self, TreasuryCap};
    use one::option;

    // --- Soulbound Token (SBT) ---

    // A Soulbound Token that grants specific unlocks (e.g., "macrophage").
    // It has 'key' but NOT 'store', so it cannot be transferred.
    public struct UnlockSBT has key {
        id: UID,
        unlock_type: vector<u8>, // e.g., b"macrophage"
        creation_time: u64,
    }

    // Error codes
    const EALREADY_HAS_SBT: u64 = 1;

    // Mint an Unlock SBT for the sender.
    public entry fun mint_unlock_sbt(unlock_type: vector<u8>, ctx: &mut TxContext) {
        let sbt = UnlockSBT {
            id: object::new(ctx),
            unlock_type: unlock_type,
            creation_time: tx_context::epoch(ctx),
        };
        transfer::transfer(sbt, tx_context::sender(ctx));
    }

    // --- USDT Simulation ---

    // One-time witness for the coin
    public struct USDT has drop {}

    fun init(witness: USDT, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            6, 
            b"USDT", 
            b"Tether USD", 
            b"Simulated USDT for GameFi", 
            option::none(), 
            ctx
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx));
    }

    public entry fun mint_usdt(
        treasury_cap: &mut TreasuryCap<USDT>, 
        amount: u64, 
        recipient: address, 
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }

    // --- Randomness (Mock) ---
    
    // In a real OneChain environment, we would use `one::random`.
    // For now, we simulate a function that would return a random value.
    // This function is just a placeholder for the logic.
    public fun get_random_outcome(ctx: &TxContext): u64 {
        // Mock randomness using transaction hash or timestamp in a real scenario if VRF isn't ready.
        // Here we just return a dummy value.
        let epoch = tx_context::epoch(ctx);
        epoch % 100 // Return 0-99
    }
}
