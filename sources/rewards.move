module my_first_package::rewards {
    use one::tx_context::{TxContext};
    use one::random::{Self, Random};
    use my_first_package::inventory::{Self, Inventory};

    public fun claim_wave_reward(
        inventory: &mut Inventory,
        wave: u64,
        r: &Random,
        ctx: &mut TxContext
    ) {
        // Only waves > 5 give rewards
        if (wave <= 5) return;

        // Calculate probability: 30% base + 5% per wave after 5
        // Wave 6: 30%
        // Wave 7: 35%
        // ...
        // Cap at 75%
        let mut chance = 30 + (wave - 6) * 5;
        if (chance > 75) {
            chance = 75;
        };

        let mut generator = random::new_generator(r, ctx);
        let roll = random::generate_u8_in_range(&mut generator, 0, 99); // 0-99

        // If roll is less than chance, player wins!
        if ((roll as u64) < chance) {
            // Determine which card to give (25% chance for each)
            let card_roll = random::generate_u8_in_range(&mut generator, 0, 3);
            
            if (card_roll == 0) {
                inventory::update_card_inventory(inventory, b"heal", 1, true);
            } else if (card_roll == 1) {
                inventory::update_card_inventory(inventory, b"nuke", 1, true);
            } else if (card_roll == 2) {
                inventory::update_card_inventory(inventory, b"freeze", 1, true);
            } else {
                inventory::update_card_inventory(inventory, b"poison", 1, true);
            };
        };
    }

    public fun create_inventory_and_claim_reward(
        wave: u64,
        r: &Random,
        ctx: &mut TxContext
    ) {
        let mut inventory = inventory::new_inventory(ctx);
        claim_wave_reward(&mut inventory, wave, r, ctx);
        inventory::transfer_to_sender(inventory, ctx);
    }
}
