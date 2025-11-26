module my_first_package::usdt {
    use one::coin::{Self, TreasuryCap};
    use std::option;
    use one::transfer;
    use one::tx_context::{Self, TxContext};

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

    public entry fun mint(
        treasury_cap: &mut TreasuryCap<USDT>, 
        amount: u64, 
        recipient: address, 
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }
}
