module my_first_package::game_core {
    use one::object::{Self, UID};
    use one::transfer;
    use one::tx_context::{Self, TxContext};
    use one::package;
    use one::display;
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

    // A Soulbound Token that serves as a "License" to play the game.
    public struct DefenderLicense has key {
        id: UID,
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
        display::update_version(&mut display_p);
        transfer::public_transfer(display_p, tx_context::sender(ctx));

        // --- Basophil Display ---
        let keys_b = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
        ];
        let values_b = vector[
            string::utf8(b"Basophil"),
            string::utf8(b"A heavy bomber unit unlocked at Wave 3."),
            string::utf8(b"https://raw.githubusercontent.com/TanBoonXuan2005/my_first_dapp/main/frontend-react/public/assets/animation_frames/Basophil/Basophil_Idle.png"),
        ];
        let mut display_b = display::new_with_fields<Basophil>(
            &publisher, keys_b, values_b, ctx
        );
        display::update_version(&mut display_b);
        transfer::public_transfer(display_b, tx_context::sender(ctx));

        // --- Defender License Display ---
        let keys_l = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
        ];
        let values_l = vector[
            string::utf8(b"Defender License"),
            string::utf8(b"Official license to defend the host against viral invasions."),
            string::utf8(b"https://raw.githubusercontent.com/TanBoonXuan2005/my_first_dapp/main/frontend-react/public/assets/ui/DefenderLicense.png"),
        ];
        let mut display_l = display::new_with_fields<DefenderLicense>(
            &publisher, keys_l, values_l, ctx
        );
        display::update_version(&mut display_l);
        transfer::public_transfer(display_l, tx_context::sender(ctx));

        // --- NK Cell Display ---
        let keys_nk = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
        ];
        let values_nk = vector[
            string::utf8(b"NK Cell"),
            string::utf8(b"A high-damage single-target unit unlocked at Wave 5."),
            string::utf8(b"https://raw.githubusercontent.com/TanBoonXuan2005/my_first_dapp/main/frontend-react/public/assets/animation_frames/NK_Cell/NK_Cell_Idle.png"),
        ];
        let mut display_nk = display::new_with_fields<NKCell>(
            &publisher, keys_nk, values_nk, ctx
        );
        display::update_version(&mut display_nk);
        transfer::public_transfer(display_nk, tx_context::sender(ctx));

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
        level: u64,
        attack_speed: u64, // in ms (e.g., 2000 for 2.0s)
        damage: u64,
        range: u64,
        damage_type: u8, // 0: Single, 1: Area
    }

    /// Platelet: Unlocked at Wave 4
    /// Removed 'store' ability to make it a true Soulbound Token (SBT)
    public struct Platelet has key {
        id: UID,
        level: u64,
        attack_speed: u64, // in ms (e.g., 1000 for 1.0s)
        damage: u64,
        range: u64,
        damage_type: u8, // 0: Single, 1: Area
    }

    public struct Basophil has key {
        id: UID,
        level: u64,
        attack_speed: u64, // in ms
        damage: u64,
        range: u64,
        damage_type: u8, // 0: Single, 1: Area
    }

    /// NK Cell: Unlocked at Wave 5
    public struct NKCell has key {
        id: UID,
        level: u64,
        attack_speed: u64, // in ms
        damage: u64,
        range: u64,
        damage_type: u8, // 0: Single, 1: Area
    }

    /// Mint a Macrophage SBT to the sender
    entry fun mint_macrophage(ctx: &mut TxContext) {
        let macrophage = Macrophage {
            id: object::new(ctx),
            level: 1,
            attack_speed: 2000, // 2.0s
            damage: 50,
            range: 120,
            damage_type: 1, // Area
        };
        transfer::transfer(macrophage, tx_context::sender(ctx));
    }

    /// Mint a Platelet SBT to the sender
    entry fun mint_platelet(ctx: &mut TxContext) {
        let platelet = Platelet {
            id: object::new(ctx),
            level: 1,
            attack_speed: 1000, // 1.0s
            damage: 5,
            range: 180,
            damage_type: 0, // Single (Net)
        };
        transfer::transfer(platelet, tx_context::sender(ctx));
    }

    /// Mint a Basophil SBT to the sender
    entry fun mint_basophil(ctx: &mut TxContext) {
        let basophil = Basophil {
            id: object::new(ctx),
            level: 1,
            attack_speed: 2500, // 2.5s
            damage: 25,
            range: 200,
            damage_type: 1, // Area
        };
        transfer::transfer(basophil, tx_context::sender(ctx));
    }

    /// Mint an NK Cell SBT to the sender
    entry fun mint_nk_cell(ctx: &mut TxContext) {
        let nk_cell = NKCell {
            id: object::new(ctx),
            level: 1,
            attack_speed: 3000, // 3.0s
            damage: 100,
            range: 400,
            damage_type: 0, // Single
        };
        transfer::transfer(nk_cell, tx_context::sender(ctx));
    }

    /// Burn a Macrophage SBT (since it cannot be transferred)
    entry fun burn_macrophage(macrophage: Macrophage) {
        let Macrophage { id, level: _, attack_speed: _, damage: _, range: _, damage_type: _ } = macrophage;
        object::delete(id);
    }

    /// Burn a Platelet SBT (since it cannot be transferred)
    entry fun burn_platelet(platelet: Platelet) {
        let Platelet { id, level: _, attack_speed: _, damage: _, range: _, damage_type: _ } = platelet;
        object::delete(id);
    }

    /// Burn a Basophil SBT
    entry fun burn_basophil(basophil: Basophil) {
        let Basophil { id, level: _, attack_speed: _, damage: _, range: _, damage_type: _ } = basophil;
        object::delete(id);
    }

    /// Burn an NK Cell SBT
    entry fun burn_nk_cell(nk_cell: NKCell) {
        let NKCell { id, level: _, attack_speed: _, damage: _, range: _, damage_type: _ } = nk_cell;
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

    // --- Defender License ---

    /// Mint a Defender License to the sender
    entry fun mint_defender_license(ctx: &mut TxContext) {
        let license = DefenderLicense {
            id: object::new(ctx),
            creation_time: tx_context::epoch(ctx),
        };
        transfer::transfer(license, tx_context::sender(ctx));
    }

    // --- Magic Card Inventory (Single SBT) ---

    public struct MagicCardInventory has key {
        id: UID,
        heal: u64,
        nuke: u64,
        freeze: u64,
        poison: u64,
    }

    /// Create a new Magic Card Inventory for the sender
    entry fun create_inventory(ctx: &mut TxContext) {
        let inventory = MagicCardInventory {
            id: object::new(ctx),
            heal: 0,
            nuke: 0,
            freeze: 0,
            poison: 0,
        };
        transfer::transfer(inventory, tx_context::sender(ctx));
    }

    /// Update the inventory count for a specific card
    /// is_increase: true to add, false to consume
    entry fun update_card_inventory(
        inventory: &mut MagicCardInventory, 
        card_type: vector<u8>, 
        amount: u64, 
        is_increase: bool
    ) {
        let type_str = string::utf8(card_type);
        let heal_str = string::utf8(b"heal");
        let nuke_str = string::utf8(b"nuke");
        let freeze_str = string::utf8(b"freeze");
        let poison_str = string::utf8(b"poison");

        if (type_str == heal_str) {
            if (is_increase) { inventory.heal = inventory.heal + amount; }
            else { inventory.heal = inventory.heal - amount; };
        } else if (type_str == nuke_str) {
            if (is_increase) { inventory.nuke = inventory.nuke + amount; }
            else { inventory.nuke = inventory.nuke - amount; };
        } else if (type_str == freeze_str) {
            if (is_increase) { inventory.freeze = inventory.freeze + amount; }
            else { inventory.freeze = inventory.freeze - amount; };
        } else if (type_str == poison_str) {
            if (is_increase) { inventory.poison = inventory.poison + amount; }
            else { inventory.poison = inventory.poison - amount; };
        };
    }

    /// Burn the Magic Card Inventory
    entry fun burn_inventory(inventory: MagicCardInventory) {
        let MagicCardInventory { id, heal: _, nuke: _, freeze: _, poison: _ } = inventory;
        object::delete(id);
    }

    /// Create inventory and add a card in one go (for first purchase)
    entry fun create_inventory_and_purchase(
        card_type: vector<u8>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let mut inventory = MagicCardInventory {
            id: object::new(ctx),
            heal: 0,
            nuke: 0,
            freeze: 0,
            poison: 0,
        };

        let type_str = string::utf8(card_type);
        let heal_str = string::utf8(b"heal");
        let nuke_str = string::utf8(b"nuke");
        let freeze_str = string::utf8(b"freeze");
        let poison_str = string::utf8(b"poison");

        if (type_str == heal_str) {
            inventory.heal = inventory.heal + amount;
        } else if (type_str == nuke_str) {
            inventory.nuke = inventory.nuke + amount;
        } else if (type_str == freeze_str) {
            inventory.freeze = inventory.freeze + amount;
        } else if (type_str == poison_str) {
            inventory.poison = inventory.poison + amount;
        };

        transfer::transfer(inventory, tx_context::sender(ctx));
    }
}
