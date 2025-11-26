module my_first_package::game_core {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::package;
    use sui::display;
    use std::string::{Self, String};
    use std::option;

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
    entry fun mint_unlock_sbt(unlock_type: vector<u8>, ctx: &mut TxContext) {
        let sbt = UnlockSBT {
            id: object::new(ctx),
            unlock_type: unlock_type,
            creation_time: tx_context::epoch(ctx),
        };
        transfer::transfer(sbt, tx_context::sender(ctx));
    }

    // --- USDT Simulation ---
    // Moved to usdt.move to avoid OTW conflict with package::claim

    // One-time witness for the package
    public struct GAME_CORE has drop {}

    fun init(witness: GAME_CORE, ctx: &mut TxContext) {
        // Claim the Publisher object for the package
        let publisher = package::claim(witness, ctx);

        // --- Macrophage Display ---
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
        ];
        let values = vector[
            string::utf8(b"Macrophage"),
            string::utf8(b"A powerful defense unit unlocked at Wave 2."),
            string::utf8(b"https://raw.githubusercontent.com/TanBoonXuan2005/my_first_dapp/main/frontend-react/public/assets/animation_frames/Macrophage/Macrophage_Idle(Excited).png"),
        ];
        let mut display = display::new_with_fields<Macrophage>(
            &publisher, keys, values, ctx
        );
        display::update_version(&mut display);
        transfer::public_transfer(display, tx_context::sender(ctx));

        // --- Platelet Display ---
        let keys_p = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
        ];
        let values_p = vector[
            string::utf8(b"Platelet"),
            string::utf8(b"A healing unit unlocked at Wave 4."),
            string::utf8(b"https://raw.githubusercontent.com/TanBoonXuan2005/my_first_dapp/main/frontend-react/public/assets/animation_frames/Platelet/Platelet_Idle.png"),
        ];
        let mut display_p = display::new_with_fields<Platelet>(
            &publisher, keys_p, values_p, ctx
        );
        display::update_version(&mut display_p);
        transfer::public_transfer(display_p, tx_context::sender(ctx));

        transfer::public_transfer(publisher, tx_context::sender(ctx));
    }

    // --- Randomness (Mock) ---
    
    // In a real Sui environment, we would use `sui::random`.
    // For now, we simulate a function that would return a random value.
    // This function is just a placeholder for the logic.
    public fun get_random_outcome(ctx: &TxContext): u64 {
        // Mock randomness using transaction hash or timestamp in a real scenario if VRF isn't ready.
        // Here we just return a dummy value.
        let epoch = tx_context::epoch(ctx);
        epoch % 100 // Return 0-99
    }

    // --- Game Asset SBTs ---
    //
    // GUIDE: HOW TO ADD A NEW SBT
    // 1. Define a new struct with `has key` (NO `store`).
    //    Example: public struct NewItem has key { id: UID, ... }
    //
    // 2. In `init` function, create a `Display` object for it.
    //    - Define keys: ["name", "description", "image_url"]
    //    - Define values: ["Item Name", "Description", "URL"]
    //    - Call `display::new_with_fields` and `display::update_version`.
    //    - Transfer display to sender.
    //
    // 3. Create a mint function `entry fun mint_new_item(ctx: &mut TxContext)`.
    //    - Create the object and `transfer::transfer` it to the sender.
    //
    // 4. Create a burn function `entry fun burn_new_item(item: NewItem)`.
    //    - Destructure the struct and call `object::delete(id)`.

    /// Macrophage: Unlocked at Wave 2
    /// Removed 'store' ability to make it a true Soulbound Token (SBT)
    public struct Macrophage has key {
        id: UID,
        power: u64,
    }

    /// Platelet: Unlocked at Wave 4
    /// Removed 'store' ability to make it a true Soulbound Token (SBT)
    public struct Platelet has key {
        id: UID,
        healing_factor: u64,
    }

    /// Mint a Macrophage SBT to the sender
    entry fun mint_macrophage(ctx: &mut TxContext) {
        let macrophage = Macrophage {
            id: object::new(ctx),
            power: 100,
        };
        transfer::transfer(macrophage, tx_context::sender(ctx));
    }

    /// Mint a Platelet SBT to the sender
    entry fun mint_platelet(ctx: &mut TxContext) {
        let platelet = Platelet {
            id: object::new(ctx),
            healing_factor: 50,
        };
        transfer::transfer(platelet, tx_context::sender(ctx));
    }

    /// Burn a Macrophage SBT (since it cannot be transferred)
    entry fun burn_macrophage(macrophage: Macrophage) {
        let Macrophage { id, power: _ } = macrophage;
        object::delete(id);
    }

    /// Burn a Platelet SBT (since it cannot be transferred)
    entry fun burn_platelet(platelet: Platelet) {
        let Platelet { id, healing_factor: _ } = platelet;
        object::delete(id);
    }

    // --- Magic Cards (SBTs) ---

    /// Magic Card: Grants active abilities in-game
    public struct MagicCard has key {
        id: UID,
        card_type: String, // "heal", "nuke", etc.
    }

    /// Mint a Magic Card SBT to the sender
    entry fun mint_magic_card(card_type_bytes: vector<u8>, ctx: &mut TxContext) {
        let card = MagicCard {
            id: object::new(ctx),
            card_type: string::utf8(card_type_bytes),
        };
        transfer::transfer(card, tx_context::sender(ctx));
    }

    /// Burn a Magic Card SBT
    entry fun burn_magic_card(card: MagicCard) {
        let MagicCard { id, card_type: _ } = card;
        object::delete(id);
    }
}
