module suifund::nft {
    use std::string::{String, utf8};
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url::{Self, Url};
    use sui::dynamic_field::{Self, DynamicField};
    use sui::vec_map::{Self, VecMap};

    struct SupporterNFT has key, store {
        id: UID,
        campaign_id: ID,
        contributor: address,
        amount: u64,
        timestamp: u64,
        image_url: Url,
        tier: String,
        benefits: vector<String>
    }

    struct NFTMinted has copy, drop {
        nft_id: ID,
        campaign_id: ID,
        contributor: address,
        amount: u64,
        tier: String
    }

    public fun mint_supporter_nft(
        campaign_id: ID,
        contributor: address,
        amount: u64,
        timestamp: u64,
        image_url: vector<u8>,
        tier: vector<u8>,
        benefits: vector<vector<u8>>,
        ctx: &mut TxContext
    ): SupporterNFT {
        let benefits_vec = vector::empty();
        let i = 0;
        let len = vector::length(&benefits);
        while (i < len) {
            vector::push_back(&mut benefits_vec, utf8(vector::borrow(&benefits, i)));
            i = i + 1;
        };

        let nft = SupporterNFT {
            id: object::new(ctx),
            campaign_id,
            contributor,
            amount,
            timestamp,
            image_url: url::new_unsafe_from_bytes(image_url),
            tier: utf8(tier),
            benefits: benefits_vec
        };

        // Emit minting event
        sui::event::emit(NFTMinted {
            nft_id: object::id(&nft),
            campaign_id,
            contributor,
            amount,
            tier: utf8(tier)
        });

        nft
    }

    public entry fun transfer_nft(
        nft: SupporterNFT,
        recipient: address,
        ctx: &mut TxContext
    ) {
        transfer::transfer(nft, recipient);
    }

    // Helper function to get NFT info
    public fun get_nft_info(nft: &SupporterNFT): (ID, address, u64, u64, String, vector<String>) {
        (
            nft.campaign_id,
            nft.contributor,
            nft.amount,
            nft.timestamp,
            nft.tier,
            nft.benefits
        )
    }
}