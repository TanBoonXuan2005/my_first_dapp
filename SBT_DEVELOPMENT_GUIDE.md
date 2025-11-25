# Soulbound Token (SBT) Development Guide

This guide explains how Soulbound Tokens (SBTs) are implemented in `game_core.move` and how to add new ones.

## What is an SBT?
In Sui Move, an SBT is simply an object that has the `key` ability but **NOT** the `store` ability.
- `key`: Allows the object to be owned by an address and persist in global storage.
- `store`: Allows the object to be wrapped in other objects or transferred freely.

By removing `store`, we ensure the object is "bound" to the owner and cannot be sent to anyone else.

## Metadata (Sui Display Standard)
We use the `sui::display` standard to define how the SBT looks in wallets and explorers. This is set up in the `init` function.
- **Keys**: `name`, `description`, `image_url`
- **Values**: The actual text and URL for the image.

## How to Add a New SBT

### 1. Define the Struct
Add a new struct in `sources/game_core.move`. Ensure it has `key` but **not** `store`.

```move
public struct NewItem has key {
    id: UID,
    // Add other fields if needed, e.g., power: u64
}
```

### 2. Configure Display in `init`
In the `init` function, create a `Display` object for your new struct.

```move
// Inside init function...

let keys_new = vector[
    string::utf8(b"name"),
    string::utf8(b"description"),
    string::utf8(b"image_url"),
];
let values_new = vector[
    string::utf8(b"New Item Name"),
    string::utf8(b"Description of the item."),
    string::utf8(b"https://example.com/image.png"),
];
let mut display_new = display::new_with_fields<NewItem>(
    &publisher, keys_new, values_new, ctx
);
display::update_version(&mut display_new);
transfer::public_transfer(display_new, tx_context::sender(ctx));
```

### 3. Add a Mint Function
Create an `entry` function to allow minting. Use `transfer::transfer` (not `public_transfer`) to send it to the sender.

```move
entry fun mint_new_item(ctx: &mut TxContext) {
    let item = NewItem {
        id: object::new(ctx),
    };
    transfer::transfer(item, tx_context::sender(ctx));
}
```

### 4. Add a Burn Function
Since SBTs cannot be transferred, users need a way to remove them if they want.

```move
entry fun burn_new_item(item: NewItem) {
    let NewItem { id } = item;
    object::delete(id);
}
```

## Deployment
After making these changes:
1.  Run `sui client publish --gas-budget 100000000`.
2.  Update the `PACKAGE_ID` in `frontend-react/src/chainConfig.js` with the new Package ID.
