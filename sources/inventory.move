module my_first_package::inventory {
    use one::object::{Self, UID};
    use one::transfer;
    use one::tx_context::{Self, TxContext};
    use std::string::{Self};

    public struct Inventory has key {
        id: UID,
        heal: u64,
        nuke: u64,
        freeze: u64,
        poison: u64,
    }

    public fun create_inventory(ctx: &mut TxContext) {
        let inventory = new_inventory(ctx);
        transfer::transfer(inventory, tx_context::sender(ctx));
    }

    public fun new_inventory(ctx: &mut TxContext): Inventory {
        Inventory {
            id: object::new(ctx),
            heal: 0,
            nuke: 0,
            freeze: 0,
            poison: 0,
        }
    }

    public fun update_card_inventory(
        inventory: &mut Inventory, 
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

    public fun burn_inventory(inventory: Inventory) {
        let Inventory { id, heal: _, nuke: _, freeze: _, poison: _ } = inventory;
        object::delete(id);
    }

    public fun create_inventory_and_purchase(
        card_type: vector<u8>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let mut inventory = Inventory {
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

    public fun transfer_to_sender(inventory: Inventory, ctx: &TxContext) {
        transfer::transfer(inventory, tx_context::sender(ctx));
    }
}
