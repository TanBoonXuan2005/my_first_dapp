module my_first_package::game_core {
    use one::tx_context::{TxContext};
    use one::random::{Random};
    use one::package;
    use one::transfer;
    
    // Import new modules
    use my_first_package::sbt::{Self, Macrophage, Platelet, Basophil, NKCell, MagicCard, UnlockSBT, DefenderLicense};
    use my_first_package::inventory::{Self, Inventory};
    use my_first_package::rewards;

    // --- OTW ---
    public struct GAME_CORE has drop {}

    fun init(witness: GAME_CORE, ctx: &mut TxContext) {
        // Claim the Publisher object for the package
        let publisher = package::claim(witness, ctx);
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        
        // Note: Display objects are now initialized in sbt::init
        // But sbt::init needs to be called? No, init functions run automatically for each module.
        // So sbt::init will run when the package is published.
    }

    // --- Facade: SBT Minting ---

    entry fun mint_unlock_sbt(unlock_type: vector<u8>, ctx: &mut TxContext) {
        sbt::mint_unlock_sbt(unlock_type, ctx);
    }

    entry fun mint_macrophage(ctx: &mut TxContext) {
        sbt::mint_macrophage(ctx);
    }

    entry fun mint_platelet(ctx: &mut TxContext) {
        sbt::mint_platelet(ctx);
    }

    entry fun mint_basophil(ctx: &mut TxContext) {
        sbt::mint_basophil(ctx);
    }

    entry fun mint_nk_cell(ctx: &mut TxContext) {
        sbt::mint_nk_cell(ctx);
    }

    entry fun mint_defender_license(ctx: &mut TxContext) {
        sbt::mint_defender_license(ctx);
    }

    entry fun mint_magic_card(card_type_bytes: vector<u8>, ctx: &mut TxContext) {
        sbt::mint_magic_card(card_type_bytes, ctx);
    }

    // --- Facade: SBT Burning ---

    entry fun burn_macrophage(macrophage: Macrophage) {
        sbt::burn_macrophage(macrophage);
    }

    entry fun burn_platelet(platelet: Platelet) {
        sbt::burn_platelet(platelet);
    }

    entry fun burn_basophil(basophil: Basophil) {
        sbt::burn_basophil(basophil);
    }

    entry fun burn_nk_cell(nk_cell: NKCell) {
        sbt::burn_nk_cell(nk_cell);
    }

    entry fun burn_magic_card(card: MagicCard) {
        sbt::burn_magic_card(card);
    }

    // --- Facade: Inventory ---

    entry fun create_inventory(ctx: &mut TxContext) {
        inventory::create_inventory(ctx);
    }

    entry fun update_card_inventory(
        inventory: &mut Inventory, 
        card_type: vector<u8>, 
        amount: u64, 
        is_increase: bool
    ) {
        inventory::update_card_inventory(inventory, card_type, amount, is_increase);
    }

    entry fun burn_inventory(inventory: Inventory) {
        inventory::burn_inventory(inventory);
    }

    entry fun create_inventory_and_purchase(
        card_type: vector<u8>, 
        amount: u64, 
        ctx: &mut TxContext
    ) {
        inventory::create_inventory_and_purchase(card_type, amount, ctx);
    }

    // --- Facade: Rewards ---

    entry fun claim_wave_reward(
        inventory: &mut Inventory,
        wave: u64,
        r: &Random,
        ctx: &mut TxContext
    ) {
        rewards::claim_wave_reward(inventory, wave, r, ctx);
    }

    entry fun create_inventory_and_claim_reward(
        wave: u64,
        r: &Random,
        ctx: &mut TxContext
    ) {
        rewards::create_inventory_and_claim_reward(wave, r, ctx);
    }
}
