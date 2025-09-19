module suifund::nft {
    use std::string::{String, utf8};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url::{Self, Url};

    struct SupporterNFT has key, store {
        id: UID,
        campaign_id: ID,
        contributor: address,
        amount: u64,
        timestamp: u64,
        image_url: Url,
        metadata: Metadata
    }

    struct Metadata has store {
        tier: String,
        benefits: vector<String>
    }

    public fun mint_supporter_nft(
        campaign_id: ID,
        contributor: address,
        amount: u64,
        timestamp: u64,
        image_url: vector<u8>,
        metadata: Metadata,
        ctx: &mut TxContext
    ): SupporterNFT {
        SupporterNFT {
            id: object::new(ctx),
            campaign_id,
            contributor,
            amount,
            timestamp,
            image_url: url::new_unsafe_from_bytes(image_url),
            metadata
        }
    }

    public entry fun transfer_nft(
        nft: SupporterNFT,
        recipient: address,
        ctx: &mut TxContext
    ) {
        transfer::transfer(nft, recipient);
    }
}