module my_first_package::sbt {
    use one::object::{Self, UID};
    use one::transfer;
    use one::tx_context::{Self, TxContext};
    use one::package;
    use one::display;
    use std::string::{Self, String};

    // --- OTW ---
    public struct SBT has drop {}

    // --- Structs ---

    public struct UnlockSBT has key {
        id: UID,
        unlock_type: vector<u8>,
        creation_time: u64,
    }

    public struct DefenderLicense has key {
        id: UID,
        creation_time: u64,
    }

    public struct Macrophage has key {
        id: UID,
        level: u64,
        attack_speed: u64,
        damage: u64,
        range: u64,
        damage_type: u8,
    }

    public struct Platelet has key {
        id: UID,
        level: u64,
        attack_speed: u64,
        damage: u64,
        range: u64,
        damage_type: u8,
    }

    public struct Basophil has key {
        id: UID,
        level: u64,
        attack_speed: u64,
        damage: u64,
        range: u64,
        damage_type: u8,
    }

    public struct NKCell has key {
        id: UID,
        level: u64,
        attack_speed: u64,
        damage: u64,
        range: u64,
        damage_type: u8,
    }

    public struct MagicCard has key {
        id: UID,
        card_type: String,
    }

    // --- Init ---

    fun init(witness: SBT, ctx: &mut TxContext) {
        let publisher = package::claim(witness, ctx);

        // Macrophage Display
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
        let mut display = display::new_with_fields<Macrophage>(&publisher, keys, values, ctx);
        display::update_version(&mut display);
        transfer::public_transfer(display, tx_context::sender(ctx));

        // Platelet Display
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
        let mut display_p = display::new_with_fields<Platelet>(&publisher, keys_p, values_p, ctx);
        display::update_version(&mut display_p);
        transfer::public_transfer(display_p, tx_context::sender(ctx));

        // Basophil Display
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
        let mut display_b = display::new_with_fields<Basophil>(&publisher, keys_b, values_b, ctx);
        display::update_version(&mut display_b);
        transfer::public_transfer(display_b, tx_context::sender(ctx));

        // NK Cell Display
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
        let mut display_nk = display::new_with_fields<NKCell>(&publisher, keys_nk, values_nk, ctx);
        display::update_version(&mut display_nk);
        transfer::public_transfer(display_nk, tx_context::sender(ctx));

        // Defender License Display
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
        let mut display_l = display::new_with_fields<DefenderLicense>(&publisher, keys_l, values_l, ctx);
        display::update_version(&mut display_l);
        transfer::public_transfer(display_l, tx_context::sender(ctx));

        transfer::public_transfer(publisher, tx_context::sender(ctx));
    }

    // --- Mint Functions ---

    public fun mint_unlock_sbt(unlock_type: vector<u8>, ctx: &mut TxContext) {
        let sbt = UnlockSBT {
            id: object::new(ctx),
            unlock_type: unlock_type,
            creation_time: tx_context::epoch(ctx),
        };
        transfer::transfer(sbt, tx_context::sender(ctx));
    }

    public fun mint_macrophage(ctx: &mut TxContext) {
        let macrophage = Macrophage {
            id: object::new(ctx),
            level: 1,
            attack_speed: 2000,
            damage: 50,
            range: 120,
            damage_type: 1,
        };
        transfer::transfer(macrophage, tx_context::sender(ctx));
    }

    public fun mint_platelet(ctx: &mut TxContext) {
        let platelet = Platelet {
            id: object::new(ctx),
            level: 1,
            attack_speed: 1000,
            damage: 5,
            range: 180,
            damage_type: 0,
        };
        transfer::transfer(platelet, tx_context::sender(ctx));
    }

    public fun mint_basophil(ctx: &mut TxContext) {
        let basophil = Basophil {
            id: object::new(ctx),
            level: 1,
            attack_speed: 2500,
            damage: 25,
            range: 200,
            damage_type: 1,
        };
        transfer::transfer(basophil, tx_context::sender(ctx));
    }

    public fun mint_nk_cell(ctx: &mut TxContext) {
        let nk_cell = NKCell {
            id: object::new(ctx),
            level: 1,
            attack_speed: 3000,
            damage: 100,
            range: 400,
            damage_type: 0,
        };
        transfer::transfer(nk_cell, tx_context::sender(ctx));
    }

    public fun mint_defender_license(ctx: &mut TxContext) {
        let license = DefenderLicense {
            id: object::new(ctx),
            creation_time: tx_context::epoch(ctx),
        };
        transfer::transfer(license, tx_context::sender(ctx));
    }

    public fun mint_magic_card(card_type_bytes: vector<u8>, ctx: &mut TxContext) {
        let card = MagicCard {
            id: object::new(ctx),
            card_type: string::utf8(card_type_bytes),
        };
        transfer::transfer(card, tx_context::sender(ctx));
    }

    // --- Burn Functions ---

    public fun burn_macrophage(macrophage: Macrophage) {
        let Macrophage { id, level: _, attack_speed: _, damage: _, range: _, damage_type: _ } = macrophage;
        object::delete(id);
    }

    public fun burn_platelet(platelet: Platelet) {
        let Platelet { id, level: _, attack_speed: _, damage: _, range: _, damage_type: _ } = platelet;
        object::delete(id);
    }

    public fun burn_basophil(basophil: Basophil) {
        let Basophil { id, level: _, attack_speed: _, damage: _, range: _, damage_type: _ } = basophil;
        object::delete(id);
    }

    public fun burn_nk_cell(nk_cell: NKCell) {
        let NKCell { id, level: _, attack_speed: _, damage: _, range: _, damage_type: _ } = nk_cell;
        object::delete(id);
    }

    public fun burn_magic_card(card: MagicCard) {
        let MagicCard { id, card_type: _ } = card;
        object::delete(id);
    }
}
